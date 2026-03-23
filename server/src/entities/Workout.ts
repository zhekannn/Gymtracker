import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { TrainingPlans } from './TrainingPlans';
import { IExercise, IWorkout } from '../../../shared/types'; 
@Entity({ name: "workouts" })
export class Workout implements IWorkout{
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn()
    completedAt: Date;
    @Column()
    planNameSnapshot: string;
    @Column({ type: "json" })
    exercisesSnapshot: IExercise[];
    @Column({ nullable: true })
    note: string;
    @ManyToOne(() => User, (user) => user.id)
    user: User;
    @ManyToOne(() => TrainingPlans, { nullable: true, onDelete: 'SET NULL' })
    plan: TrainingPlans;
}