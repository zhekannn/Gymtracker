import { AppDataSource } from "../data-source";
import { Request,Response } from "express";
import { TrainingPlans } from "../entities/TrainingPlans";
import { User } from "../entities/User";
import { IPlan } from "../../../shared/types";
export async function createPlan(req:Request,res:Response) {
    try{
    const plan:IPlan=req.body;
    const userRepository=AppDataSource.getRepository(User);
    const user=await userRepository.findOneBy({id:plan.userId});
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const planRepository=AppDataSource.getRepository(TrainingPlans);
    const existPlan:TrainingPlans[]=await planRepository.findBy({name:plan.name});
    if(!existPlan || (existPlan && existPlan.length>0)) return res.status(400).json({message:"You already have a plan with the same name"})
    const newPlan=planRepository.create({name:plan.name, exercises:plan.exercises, user:user});
    await planRepository.save(newPlan);
    res.status(201).json({message: "Plan was successfully created", plan: newPlan})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}