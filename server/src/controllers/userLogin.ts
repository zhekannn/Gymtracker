import { Request, Response } from "express";
import { IUser } from "../../../shared/types";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
export async function login(req:Request, res:Response){
    try{
        const { username, password } = req.body;
        const userRepo=AppDataSource.getRepository(User);
        const user=await userRepo.findOneBy({username});
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const { password: _, ...userWithoutPassword } = user;
        const finalResponse: IUser = userWithoutPassword;
        return res.status(200).json(finalResponse);
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}