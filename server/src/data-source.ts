import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
import { User } from "./entities/User.js";
import { TrainingPlans } from "./entities/TrainingPlans.js";
import { Workout } from "./entities/Workout.js";
import { Exercise } from "./entities/Exercise.js";

const isProductionOrCloud = process.env.DB_HOST?.includes("supabase")
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || ""),
  database: process.env.DB_NAME || "postgres",
  synchronize: true,
  logging: true,
  entities: [User, TrainingPlans, Workout, Exercise],
  ssl: isProductionOrCloud ? { rejectUnauthorized: false } : false,
});
