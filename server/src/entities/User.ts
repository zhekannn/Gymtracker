import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {IUser} from "../../../shared/types"
import { TrainingPlans } from "./TrainingPlans";

@Entity({ name: "users" })
export class User implements IUser{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    username:string;
    @Column({ unique: true })
    email: string;
    @Column()
    weight?: number;
    @Column()
    height?: number;
    @Column()
    password: string;
    @OneToMany(()=>TrainingPlans, (training)=> training.user)
    plans:TrainingPlans[];
}