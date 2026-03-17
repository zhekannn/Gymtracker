import dotenv from 'dotenv';
dotenv.config();
import app  from './app';
import { PORT } from './config/jwt';
import { AppDataSource } from './data-source';
AppDataSource.initialize().then(()=>{app.listen(PORT, ()=>{
    console.log("Server is started!");
})}).catch((err) => console.error("Error during Data Source initialization", err));