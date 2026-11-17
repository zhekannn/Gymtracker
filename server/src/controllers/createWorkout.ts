import type { Request, Response } from "express";
import { WorkoutService } from "../services/workoutService.js";
import { workoutSchema } from "../validation/schemas.js";

export async function createWorkout(req: Request, res: Response) {
  const data = workoutSchema.parse(req.body);
  const workout = await new WorkoutService().create(data, req.user!.id);
  return res.status(201).json({ message: "Workout saved!", workout });
}
