import { Workout } from "../entities/Workout";
import { AppDataSource } from "../data-source";
import { IWorkout } from "../../../shared/types";
export class WorkoutService{
    private workoutRepo=AppDataSource.getRepository(Workout);
    public async getWorkouts(userId:number) {
        const workouts = await this.workoutRepo.find({ where: { userId: userId } });
        return workouts;
        }
    public async create(workout:IWorkout, userId:number){
        const newWorkout=this.workoutRepo.create({...workout, userId:userId});
        return await this.workoutRepo.save(newWorkout);
    }
    public async delete(workoutId:number, userId:number){
        return await this.workoutRepo.delete({userId:userId, id:workoutId});
    }
}