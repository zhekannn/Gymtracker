import { AppDataSource } from "../data-source.js";
import { TrainingPlans } from "../entities/TrainingPlans.js";
import { IExercise } from "../../../shared/types.js";
import { DeleteResult } from "typeorm";
import { GoogleGenAI } from "@google/genai";
import { Exercise } from "../entities/Exercise.js";
import { GEMINI_API_KEY } from "../config/jwt.js";
import { planSchema, type PlanInput, type GeneratePlanInput } from "../validation/schemas.js";
import { HttpError } from "../utils/HttpError.js";
export class PlanService{
    private planRepo=AppDataSource.getRepository(TrainingPlans);
    private exRepo=AppDataSource.getRepository(Exercise);
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
    public async create(plan:PlanInput, userId:number): Promise<TrainingPlans>{
        const newPlan=this.planRepo.create({name:plan.name, exercises:plan.exercises, userId});
        const result=await this.planRepo.insert(newPlan);
        newPlan.id=result.identifiers[0]!.id;
        return newPlan;
    }
    public async select(userId:number): Promise<TrainingPlans[]>{
        return await this.planRepo.findBy({userId:userId});
    }
    public async generateWithAI(data:GeneratePlanInput, userId:number){
        if (!GEMINI_API_KEY) throw new HttpError(503, "AI generation is not configured");
        const availableExercises = await this.exRepo.find({
            select: ["id", "name", "muscleGroup"], 
          });
      
          if (!availableExercises || availableExercises.length === 0) {
            throw new Error("No exercises found in database to generate a plan.");
          }
          const exercisesListString = availableExercises
            .map((ex) => `ID: ${ex.id}, Name: "${ex.name}"${ex.muscleGroup ? `, Category: ${ex.muscleGroup}` : ""}`)
            .join("\n");
           const ai = new GoogleGenAI({apiKey:GEMINI_API_KEY, httpOptions:{timeout:30_000}});
      
          const prompt = `
            You are a professional fitness coach. Create a workout plan based on the user request.
      
            USER PROFILE:
            - Goal: ${data.goal}
            - Days per week: ${data.daysCount}
            - Experience level: ${data.experience}
            - Additional notes: ${data.additionalNotes || "None"}
            - Weight: ${data.weight}
            - Height: ${data.height}
            - Age: ${data.age}
      
            CRITICAL RULE:
            You MUST ONLY select exercises from the following ALLOWED EXERCISES list. 
            Do NOT invent new exercises. Use the exact "id" from the list for each selected exercise.
      
            ALLOWED EXERCISES:
            ${exercisesListString}
          `;
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  name: { 
                    type: "STRING", 
                    description: "A concise and catchy name for the plan (e.g., '3-Day Strength Split')" 
                  },
                  exercises: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        exerciseId: { 
                          type: "NUMBER", 
                          description: "The exact ID of the exercise from the provided list" 
                        },
                        name:{type:"STRING", description:"The exact Name of the exercise from the provided list"},
                        sets: { type: "NUMBER" },
                        reps: { type: "NUMBER" },
                        weight: { type: "NUMBER" },
                      },
                      required: ["exerciseId", "name", "sets", "reps", "weight"],
                    },
                  },
                },
                required: ["name", "exercises"],
              },
            },
          });
      
          let generatedData: unknown;
          try { generatedData = JSON.parse(response.text || ""); }
          catch { throw new HttpError(502, "AI returned an invalid plan. Please try again"); }
          const parsed = planSchema.safeParse(generatedData);
          if (!parsed.success) throw new HttpError(502, "AI returned an invalid plan. Please try again");
          const allowed = new Map(availableExercises.map(exercise => [exercise.id, exercise.name]));
          for (const exercise of parsed.data.exercises) {
            const name = allowed.get(exercise.exerciseId);
            if (!name) throw new HttpError(502, "AI returned an unknown exercise. Please try again");
            exercise.name = name;
          }
          return await this.create(parsed.data, userId);
    }
}
