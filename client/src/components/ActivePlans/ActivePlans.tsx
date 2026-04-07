import { FileText } from "lucide-react"
import { IPlan,IExercise } from "../../../../shared/types"
import { Edit } from "lucide-react";
import AlertDialogDelete from "./AlertDialogDelete";
import { Button } from "../ui/button";
import DialogEdit from "./DialogEdit";
interface ActivePlansProps {
  plans: IPlan[];
  onDelete: (id: number) => void;
  onUpdatePlan:(id:number, plan:IPlan)=>void;
}
export default function ActivePlans({plans, onDelete, onUpdatePlan}: ActivePlansProps){
  function handleUpdate(plan:IPlan){
  }
    return(
        <>
        <div className=" md:w-[50%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        <div className="flex">
            <FileText className="text-primary" size={25}/>
            <p className="text-xl ml-[0.5em]">Your active plans</p>
        </div>
        {plans?.length==0 &&
        <p className="mt-[2em] text-lg">This list is empty</p>
        }
        {
  plans?.map((plan) => (
    <div key={plan.id} className="w-full mb-6 p-4 bg-[#1E293B]/50 rounded-xl border border-primary/10">
      <div className="flex items-center mb-3">
      <h3 className="text-lg font-bold text-primary mr-2">{plan.name}</h3>
      <AlertDialogDelete onChange={()=>onDelete(plan.id!)}></AlertDialogDelete>
      <DialogEdit array={plan} onUpdate={(editPlan)=>onUpdatePlan(plan.id!,editPlan)}/>
      </div>
      <div className="space-y-2">
        {plan.exercises?.map((ex:IExercise, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center text-sm bg-[#0F172A] p-2 rounded-md border border-slate-700"
          >
            <span className="font-medium text-slate-200 w-1/3">{ex.name}</span>
            <div className="flex gap-4 text-slate-400">
              <span>{ex.sets} x {ex.reps}</span>
              <span className="text-primary font-mono">{ex.weight} kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))
}
 </div>
 </>
    )
}