import { Entity,PrimaryGeneratedColumn, Column } from "typeorm";
@Entity({name:"exercises"})
export class Exercise{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({unique: true})
    name:string;
    @Column()
    muscleGroup:string;
    @Column({nullable:true, type:'text'})
    description:string;
}