import { Request,Response } from "express";
import { StatService } from "../services/statService";
export async function getStats(req:Request, res:Response) {
    try{
    const userId=Number((req as any).user.id);
    if (!userId || isNaN(userId)) {
        return res.status(401).json({ message: "Unauthorized: Invalid user ID" });
      }
    const statService=new StatService();
    const [exerciseStats, userStats] = await Promise.all([
        statService.getExerciseStats(userId),
        statService.getUserStats(userId),
      ]);
    return res.status(200).json({exerciseStats:exerciseStats, userStats:userStats})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"Server error"});
    }
}