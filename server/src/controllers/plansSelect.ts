import { IPlan } from "../../../shared/types";
import { AppDataSource } from "../data-source";
import { Request,Response } from "express";
import { TrainingPlans } from "../entities/TrainingPlans";
export async function plansSelect(req:Request,res:Response) {
    try{
        const user = req.query.userId;
        if(!user){
            return res.status(400).json({ message: "User ID is missing in query" });
        }
        const plansRepo=AppDataSource.getRepository(TrainingPlans);
        const plans:TrainingPlans[]=await plansRepo.find({where: { user: { id: Number(user) }}});
        const formattedPlans=plans.map((plan)=>{
            const {user, ...otherData}=plan;
            return otherData as IPlan;
    })
       return res.status(200).json({plan:formattedPlans});
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:"Server error"})
    }
}