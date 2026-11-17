import type { Request, Response } from "express";
import { sendMail } from "../services/sendMail.js";
import { UserService } from "../services/userService.js";
import { signUserToken } from "../services/authTokens.js";
import { registrationSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/HttpError.js";

export async function register(req: Request, res: Response) {
  const data = registrationSchema.parse(req.body);
  const service = new UserService();
  if (await service.checkName(data.username) || await service.checkEmail(data.email)) {
    throw new HttpError(409, "Username or email is already in use");
  }
  const savedUser = await service.create(data, await service.hashPassword(data.password));
  const token = signUserToken(savedUser, data.rememberMe);
  void sendMail(savedUser.email, "Welcome!", "<p>Welcome to your GymTracker account</p>");
  return res.status(201).json({
    user: {
      id: savedUser.id, username: savedUser.username, email: savedUser.email,
      height: savedUser.height, weight: savedUser.weight, birthDate: savedUser.birthDate,
    }, token,
  });
}
