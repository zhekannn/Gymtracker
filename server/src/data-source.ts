import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1605Zhekan",
    database: "gymtracker",
    synchronize: true,
    logging: false,
    entities: [User],
    subscribers: [],
    migrations: [],
});
