import { AppDataSource } from "../data-source";
import { Request,Response } from "express";
import { TrainingPlans } from "../entities/TrainingPlans";
import { User } from "../entities/User";
import { IPlan } from "../../../shared/types";
export async function createPlan(req:Request,res:Response) {
    const plan:IPlan=req.body;
    const userRepository=AppDataSource.getRepository(User);
    const user=userRepository.findOneBy({id:plan.userId});
    const planRepository=AppDataSource.getRepository(TrainingPlans);
    
}