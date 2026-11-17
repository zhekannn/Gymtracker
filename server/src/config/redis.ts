import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config({ path: [".env", "../.env"], quiet: true });
const host = process.env.REDIS_HOST || "localhost";
const tlsEnabled = process.env.REDIS_TLS === "true" ||
  (process.env.REDIS_TLS === undefined && !["localhost", "127.0.0.1", "redis"].includes(host));

export const redis = new Redis({
  host,
  port: Number(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
  ...(tlsEnabled ? { tls: { rejectUnauthorized: true } } : {}),
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 5000,
  maxRetriesPerRequest: 1,
});
redis.on("error", () => console.warn("Redis connection error"));
