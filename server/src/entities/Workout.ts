import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, AfterLoad } from 'typeorm';
import { User } from './User.js';
import { TrainingPlans } from './TrainingPlans.js';
import { IExercise, IWorkout } from '../../../shared/types.js'; 
@Entity({ name: "workouts" })
export class Workout implements IWorkout{
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn({type:"date"})
    completedAt: Date;
    @Column({ nullable: true,type:"varchar",length:255 })
    planNameSnapshot?: string;
    @Column({ type: "json" })
    exercisesSnapshot: IExercise[];
    @Column({ nullable: true,type:"varchar" })
    note?: string;
    @Column({type:"int"})
    userId: number;
    @ManyToOne(() => User, (user) => user.workouts)
    @JoinColumn({name:"userId"})
    user: User;
    @Column({ nullable: true, type:"int" })
    planId?: number;
    @ManyToOne(() => TrainingPlans, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: "planId" })
    plan: TrainingPlans;
    @Column({type: "decimal", precision: 5, scale: 2, nullable: true })
    bodyWeight:number;
}