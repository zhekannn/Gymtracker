import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config();
import app  from './app.js';
import { PORT } from './config/jwt.js';
import { AppDataSource } from './data-source.js';
AppDataSource.initialize().then(()=>{app.listen(PORT, ()=>{
    console.log("Server is started!");
})}).catch((err) => console.error("Error during Data Source initialization", err));