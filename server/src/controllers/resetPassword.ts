import type { Request, Response } from "express";
import { createHash } from "node:crypto";
import { redis } from "../config/redis.js";
import { UserService } from "../services/userService.js";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { hasPasswordVersion } from "../services/authTokens.js";
import { resetPasswordSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/HttpError.js";

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);
  const key = "reset:" + createHash("sha256").update(token).digest("hex");
  // GETDEL consumes a token atomically, so concurrent requests cannot replay it.
  const stored = await redis.getdel(key);
  const invalid = () => new HttpError(400, "Invalid or expired reset token. Please request a new password reset.");
  if (!stored) throw invalid();
  let record: { userId?: unknown; version?: unknown };
  try { record = JSON.parse(stored); } catch { throw invalid(); }
  if (!record || !Number.isSafeInteger(record.userId)) throw invalid();
  const user = await AppDataSource.getRepository(User).findOneBy({ id: record.userId as number });
  if (!user || !hasPasswordVersion(user.password, record.version)) throw invalid();
  const service = new UserService();
  const updated = await service.updatePassword(user.id, await service.hashPassword(newPassword), user.password);
  if (!updated) throw invalid();
  return res.status(200).json({ message: "Password has been successfully updated. You can now login with your new password." });
}
