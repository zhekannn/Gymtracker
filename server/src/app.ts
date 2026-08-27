import express, { Request, Response, NextFunction } from 'express';
import cors from "cors";
import userRoutes from './routes/userRoutes.js';
import { FRONTEND_URL } from './config/jwt.js';
const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true, 
}));
app.use(express.json());
app.use('/api', userRoutes);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;