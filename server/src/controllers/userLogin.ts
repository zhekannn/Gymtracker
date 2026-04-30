import { Request, Response } from "express";
import { UserService } from "../services/userService";
export async function login(req:Request, res:Response){
    try{
        const { username, password, remember } = req.body;
        const service=new UserService();
        const result = await service.login(username, password, remember);
        if (!result) {
            return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
        }
        return res.status(200).json({
            token: result.token,
            user: result.user
        });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}