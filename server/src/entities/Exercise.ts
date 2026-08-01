import { Entity,PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IExercisesList } from "../../../shared/types.js";
@Entity({name:"exercises"})
export class Exercise implements IExercisesList{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({unique: true,type:"varchar"}) 
    name:string;
    @Column({type:"varchar"})
    muscleGroup:string;
    @Column({nullable:true, type:'text'})
    description:string;
}