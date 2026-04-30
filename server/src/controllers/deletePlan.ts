import { Request,Response } from "express";
import { PlanService } from "../services/planService";
const plan=new PlanService();
export async function deletePlan(req:Request, res:Response){
    try{
    const planId=Number(req.params.id);
    const userId=(req as any).user.id;
    const planDelete=await plan.delete(planId, userId);
    if(planDelete.affected===0){
        return res.status(401).json({message:"Plan not found or Access denied!"})
    }
    else return res.status(200).json({message:"Plan deleted successfully"});
    }
    catch{
        return res.status(500).json({ message: "Server error" });
    }
}