import userRoutes from './routes/userRoutes.js';
import express  from 'express';
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
export default app;