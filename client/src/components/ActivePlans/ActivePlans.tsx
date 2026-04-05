import { FileText, Icon } from "lucide-react"
import { IPlan,IExercise } from "../../../../shared/types"
import { Button } from "../ui/button";
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface ActivePlansProps {
  plans: IPlan[];
  onDelete: (id: number) => void;
}
export default function ActivePlans({plans, onDelete}: ActivePlansProps){
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
      <div className="flex">
      <h3 className="text-lg font-bold text-primary mb-3 mr-2">{plan.name}</h3>
      <AlertDialog>
      <AlertDialogTrigger asChild>
      <Button variant="destructive" size='icon-sm' className="hover:bg-red-500 hover:text-black hover:cursor-pointer"><Trash2 /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            plan from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" className="hover:cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={()=>onDelete(plan.id!)} className="hover:bg-red-500 hover:cursor-pointer" variant="destructive">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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