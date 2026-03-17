import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { DB_PASSWORD } from "./config/jwt";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: `${DB_PASSWORD}`,
    database: "gymtracker",
    synchronize: false,
    logging: false,
    entities: [User],
    subscribers: [],
    migrations: [],
});
