import { Workout } from "../entities/Workout.js";
import { AppDataSource } from "../data-source.js";
import { IWorkout } from "../../../shared/types.js";
import { User } from "../entities/User.js";
export class WorkoutService{
    private workoutRepo=AppDataSource.getRepository(Workout);
    private userRepo=AppDataSource.getRepository(User);
    public async getWorkouts(userId:number) {
        const workouts = await this.workoutRepo.find({ where: { userId: userId } });
        return workouts;
        }
    public async create(workout:IWorkout, userId:number){
        const newWorkout=this.workoutRepo.create({...workout, userId:userId});
        if(workout.bodyWeight && workout.bodyWeight>0){
            await this.userRepo.update(userId, {
                weight: workout.bodyWeight,
              });
        }
        return await this.workoutRepo.save(newWorkout);
    }
    public async delete(workoutId:number, userId:number){
        return await this.workoutRepo.delete({userId:userId, id:workoutId});
    }
    public async getWorkoutsByUser(userId: number, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
    
        const [workouts, total] = await this.workoutRepo.findAndCount({
            where: { userId },
            order: { completedAt: "DESC" },
            take: limit,
            skip: skip,
        });
    
        const hasMore = skip + workouts.length < total;
    
        return { workouts, total, hasMore };
    }
}