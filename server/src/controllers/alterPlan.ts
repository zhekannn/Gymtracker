import { Request, Response } from "express";
import { PlanService } from "../services/planService";
const updatePlan=new PlanService();
export async function alterPlan(req:Request, res:Response) {
    try {
        const  planId  = Number(req.params.id);
        const { name, exercises} = req.body; 
        const userId=(req as any).user.id;
        const updatedPlan=await updatePlan.update(planId,userId,{name:name, exercises:exercises} );
        if(!updatedPlan) return res.status(403).json({message: "Forbidden or Plan not found"});
        return res.status(200).json({message: "Plan updated!", plan: updatedPlan});
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Server error during update" });
    }
}