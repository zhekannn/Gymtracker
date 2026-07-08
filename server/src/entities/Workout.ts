import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, AfterLoad } from 'typeorm';
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
    @AfterLoad()
    parseJsonFields() {
        if (typeof this.exercisesSnapshot === "string") {
            try {
                this.exercisesSnapshot = JSON.parse(this.exercisesSnapshot);
            } catch (e) {
                this.exercisesSnapshot = [];
            }
        }
    }
    @Column({ nullable: true })
    note: string;
    @Column()
    userId: number;
    @ManyToOne(() => User, (user) => user.workouts)
    @JoinColumn({name:"userId"})
    user: User;
    @ManyToOne(() => TrainingPlans, { nullable: true, onDelete: 'SET NULL' })
    plan: TrainingPlans;
    @Column({type: "decimal", precision: 5, scale: 2, nullable: true })
    bodyWeight:number;
}