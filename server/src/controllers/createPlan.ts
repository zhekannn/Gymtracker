import type { Request, Response } from "express";
import { PlanService } from "../services/planService.js";
import { planSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/HttpError.js";

export async function createPlan(req: Request, res: Response) {
  const data = planSchema.parse(req.body);
  const service = new PlanService();
  if (await service.exists(data.name, req.user!.id)) {
    throw new HttpError(409, "You already have a plan with the same name");
  }
  const plan = await service.create(data, req.user!.id);
  return res.status(201).json({ message: "Plan was successfully created", plan });
}
