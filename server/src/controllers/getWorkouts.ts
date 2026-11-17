import type { Request, Response } from "express";
import { WorkoutService } from "../services/workoutService.js";
import { paginationSchema } from "../validation/schemas.js";

export async function getWorkouts(req: Request, res: Response) {
  const { page, limit } = paginationSchema.parse(req.query);
  const data = await new WorkoutService().getWorkoutsByUser(req.user!.id, page, limit);
  return res.status(200).json(data);
}
