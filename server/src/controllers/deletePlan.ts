import type { Request, Response } from "express";
import { PlanService } from "../services/planService.js";
import { idSchema } from "../validation/schemas.js";

export async function deletePlan(req: Request, res: Response) {
  const result = await new PlanService().delete(idSchema.parse(req.params.id), req.user!.id);
  if (!result.affected) return res.status(404).json({ message: "Plan not found" });
  return res.status(200).json({ message: "Plan deleted successfully" });
}
