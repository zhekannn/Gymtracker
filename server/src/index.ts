import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import cors from "cors";
import bcrypt from "bcrypt";
const app = express();
app.use(cors());
app.use(express.json());
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized! 🚀");
        app.post("/api/users", async (req: Request, res: Response) => {
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
                const { password: _, ...userResponse } = savedUser;
                return res.status(201).json(userResponse);
            } catch (err) {
                console.error("Ошибка при сохранении:", err);
                return res.status(500).json({ message: "Ошибка при регистрации" });
            }
        });
        app.post('/api/login', async (req:Request, res:Response)=>{
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
                const { password: _, ...userResponse } = user;
                return res.status(200).json(userResponse);
            }
            catch(err){
                console.error(err);
                return res.status(500).json({ message: "Server error" });
            }
        })
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.error("Error during Data Source initialization", err));