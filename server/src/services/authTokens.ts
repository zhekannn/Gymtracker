import { createHmac, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import type { User } from "../entities/User.js";

// The digest reveals no password hash and changes whenever the stored password changes.
export function passwordVersion(passwordHash: string): string {
  return createHmac("sha256", JWT_SECRET).update("gymtracker-session-v1:").update(passwordHash).digest("base64url");
}

export function hasPasswordVersion(passwordHash: string, version: unknown): boolean {
  if (typeof version !== "string") return false;
  const expected = Buffer.from(passwordVersion(passwordHash));
  const received = Buffer.from(version);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function signUserToken(user: Pick<User, "id" | "username" | "password">, remember: boolean): string {
  return jwt.sign({ id: user.id, username: user.username, sv: passwordVersion(user.password) }, JWT_SECRET, {
    algorithm: "HS256", issuer: "gymtracker", audience: "gymtracker-web",
    expiresIn: remember ? "30d" : "24h",
  });
}
