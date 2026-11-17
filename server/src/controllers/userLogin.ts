import type { Request, Response } from "express";
import { UserService } from "../services/userService.js";
import { loginSchema } from "../validation/schemas.js";

export async function login(req: Request, res: Response) {
  const { username, password, remember } = loginSchema.parse(req.body);
  const result = await new UserService().login(username, password, remember);
  if (!result) return res.status(401).json({ message: "Invalid username or password" });
  return res.status(200).json(result);
}
