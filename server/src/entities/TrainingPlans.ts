import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm';
import { User } from './User';
import { IExercise, IPlan } from '../../../shared/types';
import { Exercise } from './Exercise';
@Entity({name:"trainingPlans"})
export class TrainingPlans implements IPlan{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column("json", { nullable: true })
    exercises: IExercise[];
    @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
    user: User;
}
