import { PlanService } from "../services/planService.js";
import { Request,Response } from "express";
export async function GeneratePlan(req:Request, res:Response) {
    try{
        const planService=new PlanService();
        const data=req.body;
        const userId=Number((req as any).user.id);
        const generatedPlan=await planService.generateWithAI(data, userId);
        if(!generatedPlan) return res.status(400).json({message:"Failed to generate plan"});
        return res.status(200).json({message:"Plan saved successfully!", plan:generatedPlan});
    }
    catch(err){
        console.log("Error: ", err);
        return res.status(500).json({message:"Server error"});
    }
}