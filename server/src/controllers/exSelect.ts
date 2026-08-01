import { AppDataSource } from "../data-source.js";
import { Exercise } from "../entities/Exercise.js";
import { Request,Response } from "express";
export async function exSelect(req:Request,res:Response) {
    try{
    const repo=AppDataSource.getRepository(Exercise);
    const exercises=await repo.find();
    return res.status(200).json(exercises);
    }
    catch(err){    
        console.log(err);
        return res.status(500);
    }
}