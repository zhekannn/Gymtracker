import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { redis } from "../config/redis.js";
import { UserService } from "../services/userService.js";

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const redisKey = `reset:${token}`;
    const userId = await redis.get(redisKey);
    if (!userId) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset." 
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const userService = new UserService();
    const updatedUser=await userService.updatePassword(Number(userId), hashedPassword);
    if (!updatedUser) {
        await redis.del(redisKey);
        return res.status(440).json({ message: "User not found" });
      }
    await redis.del(redisKey);

    return res.status(200).json({ 
      message: "Password has been successfully updated. You can now login with your new password." 
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}