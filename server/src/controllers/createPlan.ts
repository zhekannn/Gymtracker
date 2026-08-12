import { AppDataSource } from "../data-source.js";
import { Request,Response } from "express";
import { User } from "../entities/User.js";
import { IPlan } from "../../../shared/types.js";
import { PlanService } from "../services/planService.js";
const planServ=new PlanService();
export async function createPlan(req:Request,res:Response) {
    try{
    const plan:IPlan=req.body;
    const userRepository=AppDataSource.getRepository(User);
    const user=await userRepository.findOneBy({id:plan.userId});
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const hasInvalidFields = plan.exercises.some((exercise) => {
        const reps = Number(exercise.reps);
        const sets = Number(exercise.sets);
        const weight = Number(exercise.weight);
      
        const isRepsInvalid = !reps || reps < 1 || Number.isNaN(reps);
        const isSetsInvalid = !sets || sets < 1 || Number.isNaN(sets);
        const isWeightInvalid = weight < 0 || Number.isNaN(weight);
      
        return isRepsInvalid || isSetsInvalid || isWeightInvalid;
      });
      if(hasInvalidFields) return res.status(400).json({message:"Invalid data provided"});
    if(await planServ.exists(plan.name, plan.userId))  return res.status(400).json({message:"You already have a plan with the same name"});
    const newPlan=await planServ.create(plan);
    res.status(201).json({message: "Plan was successfully created", plan: newPlan})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}