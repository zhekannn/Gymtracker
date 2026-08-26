import { Request, Response } from "express";
import crypto from "crypto";
import { UserService } from "../services/userService.js";
import { sendMail } from "../services/sendMail.js";
import { redis } from "../config/redis.js";
import { FRONTEND_URL } from "../config/jwt.js";
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userService = new UserService();
    const user = await userService.checkEmail(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      await redis.set(`reset:${resetToken}`, user.id, "EX", 900);
      const frontendUrl = FRONTEND_URL || "http://localhost";
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #0f172a;">Password Reset Request</h2>
          <p style="color: #334155;">You requested to reset your password for your GymTracker account.</p>
          <p style="color: #334155;">Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #22c55e; color: #020617; text-decoration: none; padding: 12px 20px; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;
      await sendMail(email, "GymTracker - Password Reset Request", htmlContent);
    }
    return res.status(200).json({
      message: "If an account with that email exists, a reset link has been sent to your inbox."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}