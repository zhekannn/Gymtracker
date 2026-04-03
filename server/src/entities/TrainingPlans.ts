import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { User } from './User';
import { IExercise, IPlan } from '../../../shared/types';
@Entity({name:"trainingPlans"})
export class TrainingPlans implements IPlan{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column("json", { nullable: true })
    exercises: IExercise[];
    @Column()
    userId: number;
    @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
    @JoinColumn({name:"userId"})
    user: User;
}
