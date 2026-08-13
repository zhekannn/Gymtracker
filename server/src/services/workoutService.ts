import { Workout } from "../entities/Workout.js";
import { AppDataSource } from "../data-source.js";
import { IWorkout } from "../../../shared/types.js";
import { User } from "../entities/User.js";
import { DeleteResult } from "typeorm";
import { redis } from "../config/redis.js";
export class WorkoutService{
    private workoutRepo=AppDataSource.getRepository(Workout);
    private userRepo=AppDataSource.getRepository(User);
    public async getWorkouts(userId:number):Promise<IWorkout[]> {
        const workouts = await this.workoutRepo.find({ where: { userId: userId } });
        return workouts;
        }
    public async create(workout:IWorkout, userId:number):Promise<IWorkout>{
        const newWorkout=this.workoutRepo.create({...workout, userId:userId,completedAt: new Date()});
        if(workout.bodyWeight && workout.bodyWeight>0){
            await this.userRepo.update(userId, {
                weight: workout.bodyWeight,
              });
        }
        const keys = await redis.keys(`stats:*:${userId}*`);
            if (keys.length > 0) {
                await redis.del(keys);
              }
        return await this.workoutRepo.save(newWorkout);
    }
    public async delete(workoutId:number, userId:number):Promise<DeleteResult>{
        const result=await this.workoutRepo.delete({userId:userId, id:workoutId});
        const keys = await redis.keys(`stats:*:${userId}*`);
        if(result.affected && result.affected>0){
            if (keys.length > 0) {
                await redis.del(keys);
              }
        }
        return result;
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