import { createHash } from "node:crypto";
import { rateLimit, type Options } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { HttpError } from "../utils/HttpError.js";

function limiter(name: string, windowMs: number, limit: number, keyGenerator?: Options["keyGenerator"]) {
  return rateLimit({
    windowMs, limit, standardHeaders: "draft-8", legacyHeaders: false,
    message: { message: "Too many requests. Please try again later" },
    ...(keyGenerator ? { keyGenerator } : {}),
    store: new RedisStore({
      prefix: `rl:${name}:`,
      sendCommand: async (command: string, ...args: string[]) => {
        try { return await redis.call(command, ...args) as RedisReply; }
        catch (error) {
          // Let the store reload scripts after a Redis restart.
          if (error instanceof Error && error.message.startsWith("NOSCRIPT")) throw error;
          throw new HttpError(503, "Request limiting service is temporarily unavailable");
        }
      },
    }),
  });
}

const minute = 60_000;
const hour = 60 * minute;
const accountKey = (value: unknown) => createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");

// Redis shares limits across processes and restarts; sensitive routes fail closed on an outage.
export const apiLimiter = limiter("api", 15 * minute, 300);
export const loginIpLimiter = limiter("login-ip", 15 * minute, 30);
export const loginAccountLimiter = limiter("login-account", 15 * minute, 10, req => accountKey(req.body.username));
export const registrationLimiter = limiter("registration", hour, 5);
export const forgotIpLimiter = limiter("forgot-ip", 15 * minute, 10);
export const forgotAccountLimiter = limiter("forgot-account", hour, 3, req => accountKey(req.body.email));
export const resetLimiter = limiter("reset", 15 * minute, 10);
export const aiIpLimiter = limiter("ai-ip", 24 * hour, 20);
export const aiDailyLimiter = limiter("ai-daily", 24 * hour, 5, req => String(req.user!.id));
export const aiBurstLimiter = limiter("ai-burst", minute, 2, req => String(req.user!.id));
