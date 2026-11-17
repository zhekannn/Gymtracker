import type { Request, Response } from "express";
import { PlanService } from "../services/planService.js";
import { idSchema, planSchema } from "../validation/schemas.js";

export async function alterPlan(req: Request, res: Response) {
  const planId = idSchema.parse(req.params.id);
  const data = planSchema.parse(req.body);
  const plan = await new PlanService().update(planId, req.user!.id, data);
  if (!plan) return res.status(404).json({ message: "Plan not found" });
  return res.status(200).json({ message: "Plan updated!", plan });
}
