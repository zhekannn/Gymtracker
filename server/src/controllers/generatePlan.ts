import type { Request, Response } from "express";
import { PlanService } from "../services/planService.js";
import { generatePlanSchema } from "../validation/schemas.js";

export async function GeneratePlan(req: Request, res: Response) {
  const data = generatePlanSchema.parse(req.body);
  const plan = await new PlanService().generateWithAI(data, req.user!.id);
  return res.status(200).json({ message: "Plan saved successfully!", plan });
}
