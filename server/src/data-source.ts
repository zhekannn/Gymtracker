import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { DB_PASSWORD,DB_PORT,DB_HOST } from "./config/jwt.js";
import { TrainingPlans } from "./entities/TrainingPlans.js";
import { Workout } from "./entities/Workout.js";
import { Exercise } from "./entities/Exercise.js";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "postgres",
    port: Number(DB_PORT) || 5432,
    username: "postgres",
    password: `${DB_PASSWORD}`,
    database: "gymtracker",
    synchronize: false,
    logging: false,
    entities: [User, TrainingPlans, Workout, Exercise],
    subscribers: [],
    migrations: [],
});
