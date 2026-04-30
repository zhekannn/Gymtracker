import { AppDataSource } from "../data-source";
import { TrainingPlans } from "../entities/TrainingPlans";
import { IExercise } from "../../../shared/types";
import { IPlan } from "../../../shared/types";
import { DeleteResult } from "typeorm";
export class PlanService{
    private planRepo=AppDataSource.getRepository(TrainingPlans);
    public async update(planId:number, userId:number, newData:{name:string, exercises:IExercise[]}): Promise<TrainingPlans | null> {
        const plan=await this.planRepo.findOneBy({userId:userId, id:planId});
        if(!plan) return null;
        plan.name=newData.name;
        plan.exercises=newData.exercises;
        return await this.planRepo.save(plan);
    }
    public async delete(planId:number, userId:number): Promise<DeleteResult>{
        return await this.planRepo.delete({userId:userId, id:planId});
    }
    public async exists(name:string,userId:number): Promise<Boolean>{
        const existPlan=await this.planRepo.countBy({name, userId});
        if(existPlan>0) return true;
        else return false;
    }
    public async create(plan:IPlan): Promise<TrainingPlans>{
        const newPlan=this.planRepo.create({...plan});
        return await this.planRepo.save(newPlan);
    }
    public async select(userId:number): Promise<TrainingPlans[]>{
        return await this.planRepo.findBy({userId:userId});
    }
}