import { FileText } from "lucide-react"
import { IPlan,IExercise } from "../../../../shared/types"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom";
export default function ActivePlans(){
    const [message,setMessage]=useState(null);
    const [plans, setPlans]=useState<IPlan[] | null>(null)
    // const navigate=useNavigate();
    useEffect(()=>{
              async function getPlans(){
              try{
                const userId=localStorage.getItem('user');
                const id=userId ? JSON.parse(userId) : null;
                const response=await fetch(`/api/plans?userId=${id.id}`,{
                  headers:{
                    'Content-type':'application/json'
                  },
                  method: 'GET'
                });
                if(response.ok){
                  const data:IPlan[]=await response.json();
                  setPlans(data);
                }
                else{
                    const data=await response.json();
                    setMessage(data.message);
                }
              }
              catch(err){
                throw err;
              }
        }
        getPlans();
        },[])
    return(
        <>
        <div className=" md:w-[50%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        <div className="flex">
            <FileText className="text-primary" size={25}/>
            <p className="text-xl ml-[0.5em]">Your active plans</p>
        </div>
        {plans!=null && plans.length==0 &&
        <p className="mt-[2em] text-lg">This list is empty</p>
        }
        {plans !== null && plans.length > 0 &&
  plans.map((plan) => (
    <div key={plan.id} className="w-full mb-6 p-4 bg-[#1E293B]/50 rounded-xl border border-primary/10">
      <h3 className="text-lg font-bold text-primary mb-3">{plan.name}</h3>
      <div className="space-y-2">
        {plan.exercises.map((ex:IExercise, index) => (
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
{message && 
 <p>{message}</p>
 }
 </div>
 </>
    )
}