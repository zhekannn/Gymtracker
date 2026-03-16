import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import {IUser} from "../../../shared/types"

@Entity({ name: "users" })
export class User implements IUser{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;
    @Column()
    weight?: number;
    @Column()
    height?: number;
    @Column()
    password: string;
}