import { IPlan } from "../../../shared/types.js";
import { Request,Response } from "express";
import { PlanService } from "../services/planService.js";
const plan=new PlanService();
export async function plansSelect(req:Request,res:Response) {
    try{
        const user = Number(req.query.userId);
        if(!user){
            return res.status(400).json({ message: "User ID is missing in query" });
        }
        const plans=await plan.select(user);
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