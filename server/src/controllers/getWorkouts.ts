import { IWorkout } from "../../../shared/types";
import { WorkoutService } from "../services/workoutService";
import { Request, Response } from "express";
export async function getWorkouts(req:Request, res:Response) {
    try{
    const trainingService=new WorkoutService();
    const userId=(req as any).query.userId;
    const workouts:IWorkout[]=await trainingService.getWorkouts(Number(userId));

    return res.status(200).json(workouts);
    }
    catch{
        return res.status(500).json({message: "Server error"});
    }
}