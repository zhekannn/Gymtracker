import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User.js";
import { TrainingPlans } from "./entities/TrainingPlans.js";
import { Workout } from "./entities/Workout.js";
import { Exercise } from "./entities/Exercise.js";
import { InitialSchema1794910000000 } from "./migrations/1794910000000-InitialSchema.js";

dotenv.config({ path: [".env", "../.env"], quiet: true });
const production = process.env.NODE_ENV === "production";
const sslEnabled = process.env.DB_SSL === "true" || !!process.env.DB_HOST?.includes("supabase");
if (production && !process.env.DB_PASSWORD) throw new Error("DB_PASSWORD is required in production");
if (production && process.env.DB_SYNCHRONIZE === "true") throw new Error("Use migrations instead of DB_SYNCHRONIZE in production");

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gymtracker",
  synchronize: !production && process.env.DB_SYNCHRONIZE === "true",
  logging: false,
  entities: [User, TrainingPlans, Workout, Exercise],
  migrations: [InitialSchema1794910000000],
  ssl: sslEnabled ? {
    rejectUnauthorized: true,
    ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") } : {}),
  } : false,
});
