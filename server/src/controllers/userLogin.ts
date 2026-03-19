import { Request, Response } from "express";
import { IUser } from "../../../shared/types";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { sendMail } from "./sendMail";
export async function login(req:Request, res:Response){
    try{
        const { username, password, remember } = req.body;
        const userRepo=AppDataSource.getRepository(User);
        const user=await userRepo.findOneBy({username});
        if (!user ||!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: remember ? '30d' : '24h' });
        const { password: _, ...userWithoutPassword } = user;
        const finalResponse: IUser = userWithoutPassword;
        sendMail(user.email);   
        return res.status(200).json({user: finalResponse, token});
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}