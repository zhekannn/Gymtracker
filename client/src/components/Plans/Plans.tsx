import { useState,useEffect,useRef } from "react"
import { toast } from "sonner";
import { IPlan } from "../../../../shared/types";
import ActivePlans from "../ActivePlans/ActivePlans";
import CreatePlan from "../CreatePlan/CreatePlan";
export default function Plans(){
    const [plans, setPlans]=useState<IPlan[]>([]);
    const isShown =useRef(false);
    const [message,setMessage]=useState("");
    useEffect(()=>{
        async function getPlans(){
        try{
          const userId=localStorage.getItem('user');
          const id=userId ? JSON.parse(userId) : null;
          const response=await fetch(`/api/plans?userId=${id.id}`);
          if(response.ok){
            const data=await response.json();
            setPlans(data.plan.reverse());
          }
          else{
              const data=await response.json();
          }
        }
        catch(err){
            setMessage("Failed to connect to the server");
          throw err;
        }
  }
  getPlans();
  },[])
  async function deletePlan(id:number) {
    try{
      const response=await fetch(`/api/deleteplan/${id}`, {method:'DELETE'});
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
    return(
        <>
        <div className="md:flex md:grid-cols-3 w-[100%] content-center">
          <CreatePlan onPlanChange={addPlanToList}></CreatePlan>
            <ActivePlans plans={plans} onDelete={deletePlan}/>
        </div>
        </>
    )
}