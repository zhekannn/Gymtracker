import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createHash, randomBytes, X509Certificate } from "node:crypto";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import request from "supertest";
import { newDb, DataType } from "pg-mem";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = randomBytes(48).toString("base64url");
process.env.GEMINI_API_KEY = "";
process.env.DB_SYNCHRONIZE = "false";
process.env.TRUST_PROXY_HOPS = "0";
process.env.DOTENV_CONFIG_QUIET = "true";

const { AppDataSource } = await import("../dist/server/src/data-source.js");
const { redis } = await import("../dist/server/src/config/redis.js");
const { transporter } = await import("../dist/server/src/services/sendMail.js");
const { User } = await import("../dist/server/src/entities/User.js");
const { TrainingPlans } = await import("../dist/server/src/entities/TrainingPlans.js");
const { Workout } = await import("../dist/server/src/entities/Workout.js");
const { Exercise } = await import("../dist/server/src/entities/Exercise.js");
const { signUserToken } = await import("../dist/server/src/services/authTokens.js");
const { databaseTls } = await import("../dist/server/src/config/databaseTls.js");
const { InitialSchema1794910000000 } = await import("../dist/server/src/migrations/1794910000000-InitialSchema.js");

function memoryDatabase(options = {}) {
  const db = newDb({ autoCreateForeignKeyIndices: true, ...options });
  db.public.registerFunction({ name: "current_database", returns: DataType.text, implementation: () => "security_test" });
  db.public.registerFunction({ name: "version", returns: DataType.text, implementation: () => "PostgreSQL 15.0" });
  return db;
}
const db = memoryDatabase();
const isolated = db.adapters.createTypeormDataSource({
  type: "postgres", entities: [User, TrainingPlans, Workout, Exercise], synchronize: true,
});
await isolated.initialize();
AppDataSource.getRepository = isolated.getRepository.bind(isolated);
AppDataSource.transaction = isolated.transaction.bind(isolated);

const storedHash = await bcrypt.hash("Existing-password-123", 12);
await isolated.query('INSERT INTO "users" ("id","username","email","password","height") VALUES ($1,$2,$3,$4,$5),($6,$7,$8,$9,$10)',
  [101, "victim", "victim@example.invalid", storedHash, 180, 202, "attacker", "attacker@example.invalid", storedHash, 170]);
const exercise = { exerciseId: 1, name: "Squat", sets: "3", reps: "10", weight: "50" };
await isolated.query('INSERT INTO "exercises" ("id","name","muscleGroup") VALUES ($1,$2,$3)', [1, "Squat", "legs"]);
await isolated.query('INSERT INTO "trainingPlans" ("id","userId","name","exercises") VALUES ($1,$2,$3,$4),($5,$6,$7,$8)',
  [303, 101, "Victim plan", JSON.stringify([exercise]), 304, 202, "Own plan", JSON.stringify([exercise])]);
await isolated.query('INSERT INTO "workouts" ("id","userId","exercisesSnapshot","note") VALUES ($1,$2,$3,$4)',
  [404, 101, JSON.stringify([exercise]), "Victim note"]);
const backup = db.backup();
const victimToken = signUserToken({ id: 101, username: "victim", password: storedHash }, true);
const attackerToken = signUserToken({ id: 202, username: "attacker", password: storedHash }, false);
const values = new Map();
const rateEntries = new Map();
const scripts = new Map();
const mails = [];
let redisDown = false;
let cacheDown = false;

redis.get = async key => values.get(key) ?? null;
redis.getdel = async key => { const value = values.get(key) ?? null; values.delete(key); return value; };
redis.set = async (key, value, ...expiry) => { values.set(key, String(value)); assert.deepEqual(expiry, ["EX", 900]); return "OK"; };
redis.del = async (...keys) => {
  if (cacheDown) throw new Error("Fixture cache outage");
  keys.flat().forEach(key => values.delete(key));
  return keys.length;
};
redis.call = async (command, ...args) => {
  if (redisDown) throw new Error("Fixture Redis outage");
  if (command === "SCRIPT" && args[0] === "LOAD") {
    const sha = createHash("sha1").update(args[1]).digest("hex");
    scripts.set(sha, args[1]);
    return sha;
  }
  if (command === "EVALSHA") {
    const [sha, , key, windowMs] = args;
    if (!scripts.has(sha)) throw new Error("NOSCRIPT No matching script");
    const entry = rateEntries.get(key) ?? { count: 0, expires: Date.now() + Number(windowMs) };
    if (scripts.get(sha).includes('"INCR"')) entry.count++;
    rateEntries.set(key, entry);
    return [entry.count, Math.max(1, entry.expires - Date.now())];
  }
  if (command === "DEL") { args.forEach(key => rateEntries.delete(key)); return 1; }
  if (command === "DECR") { const entry = rateEntries.get(args[0]); if (entry) entry.count--; return 1; }
  throw new Error("Unexpected Redis test command: " + command);
};
transporter.sendMail = async mail => { mails.push(mail); return { messageId: "fixture-mail" }; };
const { default: app } = await import("../dist/server/src/app.js");
const api = request(app);
const bearer = token => ({ Authorization: "Bearer " + token });
const validRegistration = { username: "new-user", email: "new@example.invalid", password: "New-password-123", height: "175", weight: "75", birthDate: "1995-01-01" };

beforeEach(() => {
  backup.restore(); values.clear(); rateEntries.clear(); mails.length = 0; redisDown = false; cacheDown = false;
});
after(async () => { redis.disconnect(); await isolated.destroy(); });

test("registration rejects primary keys and nested relations without changing an account", async () => {
  for (const extra of [{ id: 101 }, { plans: [{ id: 303 }] }, { workouts: [{ id: 404 }] }]) {
    await api.post("/api/users").send({ ...validRegistration, ...extra }).expect(400);
  }
  const victim = await isolated.getRepository(User).findOneByOrFail({ id: 101 });
  assert.equal(victim.username, "victim"); assert.equal(victim.password, storedHash);
});

test("valid registration inserts a new account and omits credentials from the response", async () => {
  const response = await api.post("/api/users").send(validRegistration).expect(201);
  assert.notEqual(response.body.user.id, 101);
  assert.equal(response.body.user.password, undefined);
  const saved = await isolated.getRepository(User).findOneByOrFail({ id: response.body.user.id });
  assert(await bcrypt.compare(validRegistration.password, saved.password));
  await api.get("/api/me").set(bearer(response.body.token)).expect(200);
});

test("password policy is enforced on the server, including bcrypt UTF-8 length", async () => {
  for (const password of ["a", "short-pass", "😀".repeat(24)]) {
    await api.post("/api/users").send({ ...validRegistration, password }).expect(400);
  }
});

test("plans require authentication and query userId cannot select another user's plans", async () => {
  await api.get("/api/plans?userId=101").expect(401);
  const response = await api.get("/api/plans?userId=101").set(bearer(attackerToken)).expect(200);
  assert.deepEqual(response.body.plan.map(plan => plan.id), [304]);
});

test("plans load without a query id using the authenticated account", async () => {
  const response = await api.get("/api/plans").set(bearer(victimToken)).expect(200);
  assert.deepEqual(response.body.plan.map(plan => plan.id), [303]);
  assert(response.body.plan.every(plan => plan.userId === 101));
  await api.get("/api/plans").expect(401);
});

test("health identifies the current API without requiring a user id or Redis", async () => {
  redisDown = true;
  const response = await api.get("/api/health").expect(200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.apiVersion, 2);
  assert.equal(response.headers["cache-control"], "no-store");
});

test("Supabase TLS uses its pinned public CA and keeps certificate verification enabled", () => {
  for (const host of ["db.fixture.supabase.co", "aws-0-eu-central-1.pooler.supabase.com"]) {
    const tls = databaseTls({ DB_HOST: host });
    assert.equal(tls.rejectUnauthorized, true);
    const ca = new X509Certificate(tls.ca);
    assert(ca.ca);
    assert.equal(ca.fingerprint256.replaceAll(":", "").toLowerCase(), "807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa");
  }
  assert.equal(databaseTls({ DB_HOST: "localhost" }), false);
  assert.equal(databaseTls({ DB_HOST: "supabase.com.attacker.invalid" }), false);
  assert.deepEqual(databaseTls({ DB_HOST: "db.example.invalid", DB_SSL: "true" }), { rejectUnauthorized: true });
  assert.deepEqual(databaseTls({ DB_HOST: "db.fixture.supabase.co", DB_SSL_CA: "custom\\nCA" }), {
    rejectUnauthorized: true, ca: "custom\nCA",
  });
});

test("creating plans rejects ids/owners and creates only for the authenticated account", async () => {
  const body = { name: "New plan", exercises: [exercise] };
  for (const extra of [{ id: 303 }, { userId: 101 }, { user: { id: 101 } }]) {
    await api.post("/api/plans").set(bearer(attackerToken)).send({ ...body, ...extra }).expect(400);
  }
  const response = await api.post("/api/plans").set(bearer(attackerToken)).send(body).expect(201);
  assert.equal(response.body.plan.userId, 202);
  assert.equal((await isolated.getRepository(TrainingPlans).findOneByOrFail({ id: 303 })).name, "Victim plan");
});

test("workout creation rejects injected ids/relations and foreign plan references", async () => {
  const body = { exercisesSnapshot: [exercise], bodyWeight: 82 };
  for (const extra of [{ id: 404 }, { userId: 101 }, { user: { id: 101 } }, { plan: { id: 303 } }]) {
    await api.post("/api/workouts").set(bearer(attackerToken)).send({ ...body, ...extra }).expect(400);
  }
  await api.post("/api/workouts").set(bearer(attackerToken)).send({ ...body, planId: 303 }).expect(404);
  const response = await api.post("/api/workouts").set(bearer(attackerToken)).send({ ...body, planId: 304 }).expect(201);
  assert.equal(response.body.workout.userId, 202);
  assert.equal((await isolated.getRepository(Workout).findOneByOrFail({ id: 404 })).userId, 101);
  assert.equal(Number((await isolated.getRepository(User).findOneByOrFail({ id: 202 })).weight), 82);
});

test("editing/deleting foreign records and malformed identifiers cannot bypass ownership", async () => {
  await api.put("/api/plans/303").set(bearer(attackerToken)).send({ name: "Overwrite", exercises: [exercise] }).expect(404);
  await api.delete("/api/plans/303").set(bearer(attackerToken)).expect(404);
  await api.delete("/api/workouts/404").set(bearer(attackerToken)).expect(404);
  await api.delete("/api/plans/not-a-number").set(bearer(attackerToken)).expect(400);
});

test("malformed payloads, invalid numbers and oversized pagination return 400", async () => {
  for (const body of [{}, { name: "Plan", exercises: {} }, { name: "Plan", exercises: [] },
    { name: "Plan", exercises: [{ ...exercise, sets: "Infinity" }] },
    { name: "Plan", exercises: [{ ...exercise, weight: -1 }] }]) {
    await api.post("/api/plans").set(bearer(attackerToken)).send(body).expect(400);
  }
  for (const query of ["limit=100000", "page=-1", "limit=2garbage"]) {
    await api.get("/api/workouts?" + query).set(bearer(attackerToken)).expect(400);
  }
});

test("forged, legacy, wrong-algorithm, missing-expiry and deleted-user JWTs are rejected", async () => {
  const options = { issuer: "gymtracker", audience: "gymtracker-web", expiresIn: "1h" };
  const claims = jwt.decode(attackerToken);
  for (const token of [
    jwt.sign({ id: 101 }, "untrusted-signing-key"),
    jwt.sign({ id: 101 }, process.env.JWT_SECRET, options),
    jwt.sign({ id: 101, sv: claims.sv }, process.env.JWT_SECRET, { ...options, algorithm: "HS384" }),
    jwt.sign({ id: 101, sv: claims.sv }, process.env.JWT_SECRET, { issuer: options.issuer, audience: options.audience }),
    jwt.sign({ id: 9999, sv: claims.sv }, process.env.JWT_SECRET, options),
  ]) await api.get("/api/me").set(bearer(token)).expect(401);
});

async function resetLink() {
  await api.post("/api/auth/forgot-password").send({ email: "victim@example.invalid" }).expect(200);
  const url = new URL(mails.at(-1).html.match(/href="([^"]+)"/)[1]);
  const token = url.searchParams.get("token");
  assert(!values.has("reset:" + token), "Raw reset tokens must not be stored");
  assert(values.has("reset:" + createHash("sha256").update(token).digest("hex")));
  return token;
}

test("password reset revokes old JWTs, reset links and password; login issues a valid replacement", async () => {
  const first = await resetLink();
  const second = await resetLink();
  await api.get("/api/me").set(bearer(victimToken)).expect(200);
  await api.post("/api/auth/reset-password").send({ token: first, newPassword: "Replacement-password-123" }).expect(200);
  await api.get("/api/me").set(bearer(victimToken)).expect(401);
  for (const token of [first, second]) {
    await api.post("/api/auth/reset-password").send({ token, newPassword: "Another-password-123" }).expect(400);
  }
  await api.post("/api/login").send({ username: "victim", password: "Existing-password-123" }).expect(401);
  const login = await api.post("/api/login").send({ username: "victim", password: "Replacement-password-123" }).expect(200);
  await api.get("/api/me").set(bearer(login.body.token)).expect(200);
});

test("a password-reset token can be consumed only once, including concurrent requests", async () => {
  const token = await resetLink();
  const responses = await Promise.all([
    api.post("/api/auth/reset-password").send({ token, newPassword: "Concurrent-password-123" }),
    api.post("/api/auth/reset-password").send({ token, newPassword: "Other-concurrent-123" }),
  ]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 400]);
});

test("login and registration are limited before expensive work", async () => {
  for (let i = 0; i < 10; i++) await api.post("/api/login").send({ username: "missing-user", password: "incorrect" }).expect(401);
  const blocked = await api.post("/api/login").send({ username: "missing-user", password: "incorrect" }).expect(429);
  assert(blocked.headers["retry-after"]);
  for (let i = 0; i < 5; i++) await api.post("/api/users").send({}).expect(400);
  await api.post("/api/users").send({}).expect(429);
});

test("AI validation and per-account limits run without contacting the provider", async () => {
  await api.post("/api/ai/generate-plan").set(bearer(attackerToken)).send({ daysCount: 999 }).expect(400);
  const body = { goal: "muscle_gain", daysCount: 3, experience: "beginner" };
  for (let i = 0; i < 2; i++) await api.post("/api/ai/generate-plan").set(bearer(attackerToken)).send(body).expect(503);
  await api.post("/api/ai/generate-plan").set(bearer(attackerToken)).send(body).expect(429);
});

test("Redis failures fail closed and script cache can be recovered after restart", async () => {
  redisDown = true;
  await api.get("/api/plans").set(bearer(attackerToken)).expect(503);
  redisDown = false;
  scripts.clear();
  await api.get("/api/plans").set(bearer(attackerToken)).expect(200);
});

test("compressed, oversized and malformed request bodies are rejected safely", async () => {
  await api.post("/api/login").set("Content-Type", "application/json").set("Content-Encoding", "gzip")
    .send(gzipSync(Buffer.from("{}"))).expect(415);
  await api.post("/api/login").send({ username: "x".repeat(70_000), password: "test" }).expect(413);
  await api.post("/api/login").set("Content-Type", "application/json").send('{"password":').expect(400);
});

test("cache invalidation failure does not report an already committed workout as failed", async () => {
  cacheDown = true;
  const response = await api.post("/api/workouts").set(bearer(attackerToken)).send({ exercisesSnapshot: [exercise] }).expect(201);
  assert(await isolated.getRepository(Workout).findOneBy({ id: response.body.workout.id, userId: 202 }));
});

test("JWT configuration fails closed without a sufficiently strong secret", () => {
  for (const secret of ["", "short"]) {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", "import('./dist/server/src/config/jwt.js')"], {
      env: { ...process.env, JWT_SECRET: secret }, encoding: "utf8",
    });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /JWT_SECRET must be set/);
  }
});

test("initial migration creates a fresh schema and can baseline existing data without dropping it", async () => {
  // pg-mem's coverage guard flags column definitions ignored by a repeated IF NOT EXISTS.
  const fresh = memoryDatabase({ noAstCoverageCheck: true }).adapters.createTypeormDataSource({ type: "postgres", entities: [] });
  await fresh.initialize();
  const runner = fresh.createQueryRunner();
  try {
    const migration = new InitialSchema1794910000000();
    await migration.up(runner);
    await runner.query('INSERT INTO "users" ("username","email","height","password") VALUES ($1,$2,$3,$4)', ["preserved", "p@example.invalid", 175, storedHash]);
    await migration.up(runner);
    const rows = await runner.query('SELECT * FROM "users" WHERE "username" = $1', ["preserved"]);
    assert.equal(rows.length, 1);
  } finally { await runner.release(); await fresh.destroy(); }
});
