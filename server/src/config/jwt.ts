import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
export const PORT = process.env.PORT;
export const DB_PASSWORD=process.env.DB_PASSWORD;