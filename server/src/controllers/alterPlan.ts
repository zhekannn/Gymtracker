import { AppDataSource } from "../data-source";
import { Request,Response } from "express";
import { IPlan } from "../../../shared/types";
import { TrainingPlans } from "../entities/TrainingPlans";
export async function alterPlan(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, exercises } = req.body; 
        const trainingRepo = AppDataSource.getRepository(TrainingPlans);
        const planToUpdate = await trainingRepo.findOneBy({ id: Number(id) });

        if (!planToUpdate) {
            return res.status(404).json({ message: "Plan not found" });
        }
        planToUpdate.name = name;
        planToUpdate.exercises = exercises;
        await trainingRepo.save(planToUpdate);

        return res.status(200).json({ 
            message: "Plan updated successfully!", 
            plan: planToUpdate 
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server error during update" });
    }
}