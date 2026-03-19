import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { IUser } from "../../../shared/types";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { sendMail } from "./sendMail";
import { send } from "process";
export async function register(req:Request, res:Response) {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const { password: plainPassword, rememberMe, ...otherData } = req.body;
        const findUser=await userRepository.findOneBy({username: req.body.username});
        if(findUser)return  res.status(401).json({message: "User with such name already exists!"});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        const newUser = userRepository.create({
            ...otherData,
            password: hashedPassword
        });
        const savedResult: any = await userRepository.save(newUser);
        const token=jwt.sign({id:savedResult.id}, JWT_SECRET,{expiresIn: rememberMe ?'30d' : '24h'});
        const { password: _, ...userResponse }:User = savedResult;
        const finalResponse:IUser=userResponse;
        sendMail(req.body.email);
        return res.status(201).json({user:finalResponse, token});
    } catch (err) {
        console.error("Ошибка при сохранении:", err);
        return res.status(500).json({ message: "Ошибка при регистрации" });
    }
}