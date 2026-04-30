import { AppDataSource } from "../data-source";
import { Request,Response } from "express";
import { User } from "../entities/User";
import { IPlan } from "../../../shared/types";
import { PlanService } from "../services/planService";
const planServ=new PlanService();
export async function createPlan(req:Request,res:Response) {
    try{
    const plan:IPlan=req.body;
    const userRepository=AppDataSource.getRepository(User);
    const user=await userRepository.findOneBy({id:plan.userId});
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if(await planServ.exists(plan.name, plan.userId))  return res.status(400).json({message:"You already have a plan with the same name"});
    const newPlan=await planServ.create(plan);
    res.status(201).json({message: "Plan was successfully created", plan: newPlan})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}