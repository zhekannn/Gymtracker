import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { useState,useEffect } from "react"
  import { Link } from "react-router-dom";
export default function Workouts(){
    const [plans, setPlans]=useState(null);
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
      <SelectItem value="light">A</SelectItem>
      <SelectItem value="dark">B</SelectItem>
      <SelectItem value="system">C</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
}
    </div>
    </>
    )
}