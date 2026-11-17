import type { Request, Response } from "express";
import { PlanService } from "../services/planService.js";

export async function plansSelect(req: Request, res: Response) {
  const plans = await new PlanService().select(req.user!.id);
  return res.status(200).json({ plan: plans });
}
