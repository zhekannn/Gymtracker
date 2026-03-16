import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { IUser } from "../../../shared/types";
import { User } from "../entities/User";
export async function register(req:Request, res:Response) {
    try {
        const { password: plainPassword, ...otherData } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        const userRepository = AppDataSource.getRepository(User);
        const newUser = userRepository.create({
            ...otherData,
            password: hashedPassword
        });
        const savedResult: any = await userRepository.save(newUser);
        const savedUser = Array.isArray(savedResult) ? savedResult[0] : savedResult;
        const { password: _, ...userResponse }:User = savedUser;
        const finalResponse:IUser=userResponse;
        return res.status(201).json(finalResponse);
    } catch (err) {
        console.error("Ошибка при сохранении:", err);
        return res.status(500).json({ message: "Ошибка при регистрации" });
    }
}