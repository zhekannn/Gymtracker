import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { hasPasswordVersion } from "../services/authTokens.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ message: "A Bearer token is required" });

  let decoded: jwt.JwtPayload;
  try {
    const payload = jwt.verify(match[1]!, JWT_SECRET, {
      algorithms: ["HS256"], issuer: "gymtracker", audience: "gymtracker-web",
    });
    if (typeof payload === "string" || !Number.isSafeInteger(payload.id) || payload.id <= 0 ||
        typeof payload.exp !== "number" || typeof payload.sv !== "string") {
      return res.status(401).json({ message: "Invalid token" });
    }
    decoded = payload;
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: decoded.id });
    if (!user || !hasPasswordVersion(user.password, decoded.sv)) {
      return res.status(401).json({ message: "Session expired. Please log in again" });
    }
    req.user = { id: user.id, username: user.username };
    next();
  } catch (error) {
    next(error);
  }
}
