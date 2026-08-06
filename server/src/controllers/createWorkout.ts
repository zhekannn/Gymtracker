import { Request, Response } from "express";
import { WorkoutService } from "../services/workoutService.js";
import { IWorkout } from "../../../shared/types.js";
import { redis } from "../config/redis.js";
const workoutService = new WorkoutService();

export async function createWorkout(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const workoutData:IWorkout = req.body; 
        if (!workoutData || !workoutData.exercisesSnapshot) {
            return res.status(400).json({ message: "Invalid workout data provided" });
        }
        const newWorkout = await workoutService.create(workoutData, userId);
        await redis.del(`stats:user:${userId}`);
        return res.status(201).json({ message: "Workout saved!", workout: newWorkout });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}