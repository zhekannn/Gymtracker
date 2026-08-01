import { Request, Response } from "express";
import { WorkoutService } from "../services/workoutService.js";
export async function deleteWorkout(req:Request, res:Response){
    try{
    const workoutService=new WorkoutService();
    const userId=(req as any).user.id;
    const workoutId=Number(req.params.id);
    const deleted=await workoutService.delete(workoutId,userId);
    if(deleted.affected==0) return res.status(401).json({message:"Workout not found or Access denied!"});
    else return res.status(200).json({message:"Workout deleted successfully"});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
}