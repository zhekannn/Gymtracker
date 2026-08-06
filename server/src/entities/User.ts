import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {IUser} from "../../../shared/types.js"
import type { TrainingPlans } from "./TrainingPlans.js";
import { Workout } from "./Workout.js";
@Entity({ name: "users" })
export class User implements IUser{
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type:"varchar",length:255})
    username:string;
    @Column({ unique: true,type:"varchar",length:255 })
    email: string;
    @Column({type: "decimal", precision: 5, scale: 2, nullable: true })
    weight?: number;
    @Column({type:"int"})
    height?: number;
    @Column({type:"varchar",length:255})
    password: string;
    @Column({ type: "date", nullable: true })
    birthDate?: Date;
    @OneToMany("TrainingPlans", (plan:TrainingPlans)=> plan.user)
    plans:TrainingPlans[];
    @OneToMany(()=>Workout, (workout)=> workout.user)
    workouts:Workout[];
}