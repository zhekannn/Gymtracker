import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { sendMail } from "../services/sendMail";
import { UserService } from "../services/userService";
import { IUser } from "../../../shared/types";
const user=new UserService();
export async function register(req:Request, res:Response) {
    try {
        const { password: plainPassword, rememberMe, ...otherData } = req.body;
        if(await user.checkName(req.body.username))  return  res.status(401).json({message: "User with such name already exists!"});
        if(await user.checkEmail(otherData.email)) return  res.status(401).json({message: "User with such email already exists!"});
        const hashedPassword=await user.hashPassword(plainPassword);
        const savedUser=await user.create(otherData, hashedPassword);
        const token=jwt.sign({id:savedUser.id}, JWT_SECRET,{expiresIn: rememberMe ?'30d' : '24h'});
        const { password: _, ...userResponse } = savedUser;
        const finalResponse:IUser=userResponse;
        sendMail(req.body.email);
        return res.status(201).json({user:finalResponse, token});
    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({ message: "Error during registration" });
    }
}