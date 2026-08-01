import { WorkoutService } from "../services/workoutService.js";
import { Request, Response } from "express";
export async function getWorkouts(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const workoutService=new WorkoutService();
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const data = await workoutService.getWorkoutsByUser(userId, page, limit);

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}