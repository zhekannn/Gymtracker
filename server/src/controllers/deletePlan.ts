import { AppDataSource } from "../data-source";
import { TrainingPlans } from "../entities/TrainingPlans";
import { Request,Response } from "express";
export async function deletePlan(req:Request, res:Response){
    try{
    const planId=req.params;
    const planRepo=AppDataSource.getRepository(TrainingPlans);
    const planDelete=await planRepo.delete(planId);
    if(planDelete.affected===0){
        return res.status(401).json({message:"Plan not found"})
    }
    else return res.status(201).json({message:"Plan deleted successfully"});
    }
    catch{
        return res.status(500).json({ message: "Server error" });
    }
}