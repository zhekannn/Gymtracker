import { Request, Response } from "express";
import { PlanService } from "../services/planService.js";
import { IExercise } from "../../../shared/types.js";
const updatePlan=new PlanService();
export async function alterPlan(req:Request, res:Response) {
    try {
        const  planId  = Number(req.params.id);
        const { name, exercises} = req.body; 
        const hasInvalidFields = exercises.some((exercise:IExercise) => {
            const reps = Number(exercise.reps);
            const sets = Number(exercise.sets);
            const weight = Number(exercise.weight);
          
            const isRepsInvalid = !reps || reps < 1 || Number.isNaN(reps);
            const isSetsInvalid = !sets || sets < 1 || Number.isNaN(sets);
            const isWeightInvalid = weight < 0 || Number.isNaN(weight);
          
            return isRepsInvalid || isSetsInvalid || isWeightInvalid;
          });
          if(hasInvalidFields) return res.status(400).json({message:"Invalid data provided"});
        const userId=(req as any).user.id;
        const updatedPlan=await updatePlan.update(planId,userId,{name:name, exercises:exercises} );
        if(!updatedPlan) return res.status(403).json({message: "Forbidden or Plan not found"});
        return res.status(200).json({message: "Plan updated!", plan: updatedPlan});
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server error during update" });
    }
}