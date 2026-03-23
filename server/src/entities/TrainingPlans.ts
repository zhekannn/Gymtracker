import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { User } from './User';
import { IExercise, IPlan } from '../../../shared/types';
@Entity({name:"trainingPlans"})
export class TrainingPlans implements IPlan{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column({type:"json"})
    exercises:IExercise[];
    @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
    user: User;
}
