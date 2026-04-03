import { Entity,PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IExercisesList } from "../../../shared/types";
@Entity({name:"exercises"})
export class Exercise implements IExercisesList{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({unique: true}) 
    name:string;
    @Column()
    muscleGroup:string;
    @Column({nullable:true, type:'text'})
    description:string;
}