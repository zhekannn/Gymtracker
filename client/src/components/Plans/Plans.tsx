import { useState,useEffect,useRef } from "react"
import { toast } from "sonner";
import { IPlan } from "../../../../shared/types";
import ActivePlans from "../ActivePlans/ActivePlans";
import CreatePlan from "../CreatePlan/CreatePlan";
import { fetchUserPlans } from "../../getPlans";
import { Button } from "../ui/button";
import GenerateAiPlanDialog from "../GeneratePlanDialog/GeneratePlanDialog";
export default function Plans(){
    const [plans, setPlans]=useState<IPlan[]>([]);
    const isShown =useRef(false);
    const [message,setMessage]=useState("");
    useEffect(()=>{
      async function fetchPlans() {
        try {
          const data = await fetchUserPlans();
          setPlans(data);
      } catch (err: any) {
          setMessage(err.message);
          toast.error(err.message);
      }
      }
      fetchPlans();
  },[])
  async function deletePlan(id:number) {
    try{
      const response=await fetch(`/api/deleteplan/${id}`, {method:'DELETE', headers:{'Authorization': `Bearer ${localStorage.getItem('token')}`}});
      const data=await response.json()
      if(response.ok){
        setPlans((prev)=>prev.filter(value=>Number(value.id)!==Number(id)))
        toast.success(data.message);
      } else {
          toast.error(data.message);
      }
  } catch (err) {
      toast.error("Failed to delete plan");
  }
      }
    if(message && message.length>0 && !isShown.current) {toast.success(message, {
        duration: 2500,
      })
    isShown.current=true;
    };
    const addPlanToList = (serverMessage:string, newPlan?: IPlan) => {
        if(newPlan) setPlans((prev) => [newPlan, ...prev]); 
        setMessage(serverMessage);
        isShown.current=false
      };
      function handleUpdate(id:number,updatedPlan:IPlan){
        setPlans((prev) => 
          prev.map((plan) => (plan.id === id ? updatedPlan : plan))
      );
      }
    return(
      <div className="w-full  mx-auto space-y-6 p-4 md:p-6">
      {/* Баннер с AI кнопкой */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-[#0F172A]/60 border border-border/50 rounded-2xl gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Workout Plans</h2>
          <p className="text-xs text-slate-400 mt-1">
            Create plans manually or generate a smart plan tailored for you using AI.
          </p>
        </div>
        <GenerateAiPlanDialog onPlanGenerated={addPlanToList} />
      </div>

      {/* Пропорция 1:2 — слева создание, справа активные планы */}
      <div className="md:grid grid-cols-2 w-full md:grid-cols-12 gap-6 items-start ">
        <div className="md:col-span-4">
          <CreatePlan onPlanChange={addPlanToList} />
        </div>
        <div className="md:col-span-8">
          <ActivePlans plans={plans} onDelete={deletePlan} onUpdatePlan={handleUpdate} />
        </div>
      </div>
    </div>
    )
}