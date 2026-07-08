import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { useState,useEffect, useRef } from "react"
  import { Link } from "react-router-dom";
  import { fetchUserPlans } from "@/getPlans";
import { IPlan } from "../../../../shared/types";
import { toast } from "sonner";
export default function Workouts(){
    const [plans, setPlans]=useState<IPlan[] | null>(null);
    const [message, setMessage]=useState("");
    const shown=useRef(false);
    useEffect(()=>{
      async function getPlans() {
        
      
      try{
        const data=await fetchUserPlans();
        setPlans(data);
      }
      catch(err:any){
        setMessage(err.message);
      }
    }
    getPlans();
    }, [])
    if(message && message.length>0 && !shown.current){
      toast.error(message);
      shown.current=true;
    }
    return(<>
    <div className=" relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
    <h1 className="text-[1.5em] mb-[2em]">Conduct a workout</h1>
    {!plans &&  
    <div>
        <p>You dont have a training plan. Create it <Link to={'/plans'} className="text-primary font-medium underline decoration-primary/30 hover:decoration-primary transition-all">here</Link></p>
    </div>
    ||
    
    <Select>Select a plan
  <SelectTrigger className="w-[20vw]">
    <SelectValue placeholder="Plan" />
  </SelectTrigger>
  <SelectContent position="popper" className="bg-[#0F1133] text-secondary">
    <SelectGroup>
      {plans?.map((plan:IPlan)=>(
        <SelectItem value={plan.name} key={plan.id}>{plan.name}</SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
}
    </div>
    </>
    )
}