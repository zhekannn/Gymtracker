import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "BUG2JUQNb0QMt2RMkQKL";
export const PORT = process.env.PORT;
export const DB_PASSWORD=process.env.DB_PASSWORD;
export const GEMINI_API_KEY=process.env.GEMINI_API_KEY;
export const DB_PORT=process.env.DB_PORT;
export const DB_HOST=process.env.DB_HOST;