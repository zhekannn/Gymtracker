import type { Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { UserService } from "../services/userService.js";
import { passwordVersion } from "../services/authTokens.js";
import { sendMail } from "../services/sendMail.js";
import { redis } from "../config/redis.js";
import { CLIENT_URL } from "../config/jwt.js";
import { forgotPasswordSchema } from "../validation/schemas.js";

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await new UserService().checkEmail(email);
  if (user) {
    const resetToken = randomBytes(32).toString("hex");
    const key = "reset:" + createHash("sha256").update(resetToken).digest("hex");
    await redis.set(key, JSON.stringify({ userId: user.id, version: passwordVersion(user.password) }), "EX", 900);
    const url = new URL("/reset-password", CLIENT_URL || "http://localhost");
    url.searchParams.set("token", resetToken);
    await sendMail(email, "GymTracker - Password Reset Request",
      `<p>You requested to reset your GymTracker password.</p><p><a href="${url.href}">Reset password</a></p><p>This link expires in 15 minutes. Ignore this email if you did not request it.</p>`);
  }
  return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent to your inbox." });
}
