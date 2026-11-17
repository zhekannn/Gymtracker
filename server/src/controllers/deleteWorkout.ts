import type { Request, Response } from "express";
import { WorkoutService } from "../services/workoutService.js";
import { idSchema } from "../validation/schemas.js";

export async function deleteWorkout(req: Request, res: Response) {
  const result = await new WorkoutService().delete(idSchema.parse(req.params.id), req.user!.id);
  if (!result.affected) return res.status(404).json({ message: "Workout not found" });
  return res.status(200).json({ message: "Workout deleted successfully" });
}
