import app  from './app'
import { AppDataSource } from './data-source';
AppDataSource.initialize().then(()=>{app.listen(5000, ()=>{
    console.log("Server is started!");
})}).catch((err) => console.error("Error during Data Source initialization", err));