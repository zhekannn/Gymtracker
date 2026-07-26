import { useEffect, useState } from "react"
import { IWorkout, IExercise } from "../../../../shared/types";
import { History, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AlertDialogDelete from "../ActivePlans/AlertDialogDelete";
export default function WorkoutSection(){
    const [trainings, setTrainings]=useState<IWorkout[]>([]);
    useEffect(()=>{
        async function getTrainings(id:number) {
            try{
            const response=await fetch(`/api/workouts?userId=${id}`);
            if(response.ok){
              const data=await response.json();
              setTrainings(data);
            }
            else{
              const data=await response.json();
              toast.error(data.message || "Error!");
      
            }
          }
          catch(err){
              toast.error("Server error");
          }
            }
            const user=localStorage.getItem('user');
            if(!user) return;
            const userId=JSON.parse(user).id;
            getTrainings(userId);
    },[]);
   async function deleteWorkout(id:number){
        if(id==0){
            toast.error("invalid training");
            return;
        }
        try{
        const response=await fetch(`/api/deleteWorkout/${id}`,{
            method:"DELETE",headers:{'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        const data=await response.json();
        if(response.ok){
            setTrainings((prev)=>prev.filter(value=>Number(value.id)!==Number(id)))
            toast.success(data.message || "Success!");
        }
        else{
            toast.error(data.message || "Error");
        }
    }
    catch{
        toast.error("Server error");
    }
   }
    return(
        <>
        <div className="flex items-center gap-2 mb-6">
          <History className="text-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Training history</h3>
        </div>
          <div className="flex text-center mt-[2em] w-full">
            {trainings.length==0 &&
            <p>This list is empty. You dont have any trainings <Link to='/workouts'><Button className="w-[75%] bg-[#0F0011] text-secondary hover:cursor-pointer hover:bg-primary hover:text-black border border-primary h-[2.5em]">Create one</Button></Link></p>
            }
           {trainings && trainings.length > 0 && (
  <div className="w-full space-y-4">
    {trainings.map((training: IWorkout) => (
      <div key={training.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-left w-[100%]">
        <div className="flex justify-between">
        <h4 className="font-bold text-primary mb-2">
          {training.planNameSnapshot || "Без названия"}
        </h4>
        {/* <Button value={training.id} id={training.id?.toString()} variant="destructive" className="mb-2 hover:cursor-pointer" onClick={()=>deleteWorkout(training.id || 0)}><Trash2/></Button> */}
        <AlertDialogDelete name="workout" onChange={()=>deleteWorkout(training.id || 0)}></AlertDialogDelete>
        </div>
        <div className="pl-2 border-l-2 border-slate-700 space-y-1">
          {training.exercisesSnapshot.map((exercise: IExercise, index: number) => (
            <div key={`${exercise.name}-${index}`} className="flex justify-between text-sm">
              <span className="text-slate-300">{exercise.name}</span>
              <span className="text-slate-500 font-mono">{exercise.reps} reps</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}
          </div></>
    )
}