import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { User } from './User.js';
import { IExercise, IPlan } from '../../../shared/types.js';
@Entity({name:"trainingPlans"})
export class TrainingPlans implements IPlan{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:"varchar",length:255})
    name:string;
    @Column("json", { nullable: true })
    exercises: IExercise[];
    @Column({type:"int"})
    userId: number;
    @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
    @JoinColumn({name:"userId"})
    user: User;
}
