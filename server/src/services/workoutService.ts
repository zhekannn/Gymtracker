import { Workout } from "../entities/Workout";
import { AppDataSource } from "../data-source";
export class WorkoutService{
    private workoutRepo=AppDataSource.getRepository(Workout);
    public async getWorkouts(userId:number) {
        const workouts = await this.workoutRepo.find({ where: { userId: userId } });
        return workouts;
        }
}