import { AppDataSource } from "../data-source.js";
import { Exercise } from "../entities/Exercise.js";
import { Request,Response } from "express";
import { redis } from "../config/redis.js";
export async function exSelect(req:Request,res:Response) {
    try{
    const cacheKey = `exercises`;
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          return res.status(200).json(JSON.parse(cachedData));
        }
      } catch (err) {
        console.warn("Redis is down, fetching directly from DB..."); 
      }
      const repo=AppDataSource.getRepository(Exercise);
      const exercises=await repo.find();
      try {
        await redis.set(cacheKey, JSON.stringify(exercises), 'EX', 900);
      } catch (err) {
      }
    return res.status(200).json(exercises);
    }
    catch(err){    
        console.log(err);
        return res.status(500);
    }
}