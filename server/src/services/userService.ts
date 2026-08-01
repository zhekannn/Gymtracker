import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { IUser } from "../../../shared/types.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { sendMail } from "../services/sendMail.js";
export class UserService{
    private userRepo=AppDataSource.getRepository(User);
    public async checkName(username:string): Promise<User | null>{
        const findUser=await this.userRepo.findOneBy({username: username});
        return findUser;
    }
    public async checkEmail(email:string): Promise<User | null>{
        const findUser=await this.userRepo.findOneBy({email: email});
        return findUser;
    }
    public async hashPassword(password:string): Promise<string>{
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
    public async create(user:IUser, hashedPassword:string): Promise<User>{
        const newUser=this.userRepo.create({...user, password:hashedPassword});
        return await this.userRepo.save(newUser);
    }
    public async login(username: string, password: string, remember: boolean): Promise<{token:string, user:IUser} | null> {
        const user = await this.userRepo.findOne({where:{username}, relations:["workouts"]});

        if (!user) return null;
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return null;
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: remember ? '30d' : '24h' }
        );
        sendMail(user.email);
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                height:user.height ?? 0,
                weight:user.weight ?? 0,
                trainingCount:user.workouts.length
            }
        };
    }
}