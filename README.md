# Gymtracker

React/Vite + Express/TypeORM, PostgreSQL and Redis. Use Node.js 22.13 or newer.

## Configuration

Copy `.env.example` to `.env`. Set independent random values for `JWT_SECRET` (at least 32 bytes), `DB_PASSWORD` and `REDIS_PASSWORD`. Generate each with:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Never commit `.env`. Configure SMTP through `EMAIL_*`; AI generation also needs `GEMINI_API_KEY`.

## Docker

Set `CLIENT_URL` to the browser origin (for local Docker, `http://localhost`), then run `docker compose up --build`. Only the frontend exposes a host port. PostgreSQL, Redis and the backend stay on the Docker network. The backend applies migrations before starting. Use HTTPS termination at your trusted reverse proxy for public deployment.

The nginx proxy overwrites forwarded client IPs. `TRUST_PROXY_HOPS=1` is set only for this internal nginx/backend arrangement. Direct Node deployments default to `0`; do not enable unrestricted proxy trust. If another proxy sits in front of nginx, configure nginx real-IP handling only for its trusted addresses before relying on per-IP limits.

## Render (separate frontend and backend)

Keep both services on the same `main` revision. The backend service `Gymtracker` uses the Docker runtime with `server/Dockerfile`; the image builds TypeScript and applies migrations before starting the API.

For a Node deployment instead of Docker, build with `npm --prefix server ci --include=dev && npm --prefix server run build`, run migrations, and then start with `npm --prefix server start`. Do not run an older `dist` directory after updating the source.

The backend needs `NODE_ENV=production`, `CLIENT_URL=https://gymtracker-client.onrender.com`, a random `JWT_SECRET` of at least 32 bytes, database credentials, and Redis settings. The public Supabase Root 2021 CA is bundled for database hosts under `supabase.co` and `supabase.com`, keeping certificate and hostname verification enabled. `DB_SSL_CA` can override it when using a different provider or a rotated CA. Managed Redis needs `REDIS_TLS=true`. Use Render's assigned `PORT`.

For the frontend static site with Root Directory `client`, use Build Command `npm ci --include=dev && npm run build`, Publish Directory `dist`, and `VITE_API_URL=https://gymtracker-6kfq.onrender.com`. `VITE_API_URL` is embedded during the frontend build. Configure the SPA rewrite `/*` to `/index.html`.

If plans return `User ID is missing in query`, the frontend reached the old backend. Check `https://gymtracker-6kfq.onrender.com/api/health`: the new deployment returns `apiVersion: 2` and its Render commit revision. Deploy the latest commit on the **backend** service and inspect any failed build/start logs; restarting the old service does not deploy new source. After upgrading, log in again. Do not restore query-based authorization to hide a stale deployment.

The failed November 17 backend deployments stopped at database initialization because Supabase's CA was missing from the TLS trust configuration. The bundled public certificate fixes this without `rejectUnauthorized:false`. Certificate source: [Supabase Studio configuration](https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json), [public CA download](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt).

## Local Node development

```sh
npm ci
npm --prefix server ci
npm --prefix client ci
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d postgres redis
npm --prefix server run build
npm --prefix server run migrate
npm run dev
```

The optional local compose override binds database ports only to `127.0.0.1`. Use `CLIENT_URL=http://localhost:5173` and local DB/Redis hosts in `.env` for this mode. For managed Redis set `REDIS_TLS=true`. For cloud PostgreSQL set `DB_SSL=true` and, if required, `DB_SSL_CA` to its CA certificate. Certificate verification is always enabled.

## Upgrading an existing installation

Back up PostgreSQL before deploying. Schema synchronization and SQL parameter logging are disabled by default; production rejects `DB_SYNCHRONIZE=true`. Build and run `npm --prefix server run migrate` before starting a non-Docker server. The initial migration preserves existing tables and adds a unique username index. If old data contains duplicate usernames, resolve those duplicates before applying the migration; it will stop rather than delete accounts. The baseline intentionally has no automatic destructive rollback.

Existing JWTs and password-reset links must be replaced after this update: log in again or request a new reset link. Password resets also invalidate all prior sessions and reset links for that account. New/reset passwords require at least 12 characters and at most 72 UTF-8 bytes. Existing passwords remain usable for login.

If the old hardcoded JWT or database password was used, replace it in your deployment. For an existing PostgreSQL volume, also change the role password in PostgreSQL: setting `POSTGRES_PASSWORD` only initializes a new volume. Keep the volume; do not remove user data to rotate credentials.

Request limits are stored in Redis and shared across backend processes. Redis is required for these limits; requests fail closed during an outage. Login has limits per IP and username; password recovery per IP and email; registration per IP. AI generation is limited to 2 requests/minute and 5/day per account, and 20/day per IP, with bounded input/output and a 30-second provider timeout.

## Checks

```sh
npm test
npm run check
npm --prefix server audit
npm --prefix client audit
```

Security regression tests use an isolated in-memory PostgreSQL emulator and Redis/mail test doubles. They do not connect to your database, SMTP server or AI provider. The TypeORM `glob` override pins a patched discovery dependency without downgrading the ORM. Container images should also be rebuilt regularly to receive upstream OS patches.

As of 2026-11-17, the backend audit and both production dependency audits report no known vulnerabilities. The full frontend audit still flags the build/lint dependency `picomatch` ([GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)); no patched release is published. Its consumers are development tools and are not installed in the production nginx image. The build uses repository-controlled glob patterns. This remaining advisory has not been hidden by downgrading Vite or suppressing audit findings.
