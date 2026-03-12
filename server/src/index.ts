import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized! 🚀");
        app.post("/api/users", async (req: Request, res: Response) => {
            const userRepository = AppDataSource.getRepository(User);
            const newUser = userRepository.create(req.body); 
            const results = await userRepository.save(newUser);
            return res.send(results);
        });
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch((err) => console.error("Error during Data Source initialization", err));