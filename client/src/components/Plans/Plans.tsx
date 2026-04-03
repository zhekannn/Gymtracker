import { useState,useEffect } from "react"
import ActivePlans from "../ActivePlans/ActivePlans";
import CreatePlan from "../CreatePlan/CreatePlan";
export default function Plans(){
    return(
        <>
        <div className="md:flex md:grid-cols-3 w-[100%] content-center">
          <CreatePlan></CreatePlan>
            <ActivePlans/>
        </div>
        </>
    )
}