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
import { IExercise, IExercisesList, IPlan } from "../../../../shared/types";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ChevronsUpDown } from "lucide-react";
import { Command,CommandInput,CommandEmpty,CommandGroup,CommandItem } from "../ui/command";
import { Popover,PopoverTrigger,PopoverContent } from "../ui/popover";
import ExerciseRow from "../ActivePlans/ExerciseRow";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
export default function Workouts(){
    const [plans, setPlans]=useState<IPlan[] | null>(null);
    const [open,setOpen]=useState(false);
    const [value, setValue] = useState("");
    const [allExercises, setAllExercises] = useState<IExercisesList[] | null>(null);
    const [isLoadingExercises, setIsLoadingExercises] = useState(false);
    const [message, setMessage]=useState("");
    const [selectedPlan, setSelectedPlan]=useState<IPlan | null>(null);
    const [currentWorkout, setCurrentWorkout]=useState<IExercise[]>([]);
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
    function handlePlanChange(planId:string){
      const plan=plans?.find((p)=>p.id==Number(planId));
      if(plan) {setSelectedPlan(JSON.parse(JSON.stringify(plan)));
        setCurrentWorkout(plan.exercises);
      }
    }
    function deleteEx(index:number){
      setCurrentWorkout((prev)=>prev.filter((ex, id)=>id!=index));
    }
    async function loadAllExercisesFromDB() {
      if (allExercises) return; 

    setIsLoadingExercises(true);
    try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
            const data = await response.json();
            setAllExercises(data);
        } else {
            toast.error("Failed to load exercises database");
        }
    } catch (err) {
        toast.error("Server error while fetching exercises");
    } finally {
        setIsLoadingExercises(false);
    }
    }
    async function handleRowAdd(){
      await loadAllExercisesFromDB();
      setValue("");
      setCurrentWorkout((prev)=>[{ name: "Выберите упражнение", sets: "0", reps: "0", weight: "0", exerciseId: 0 }, 
        ...prev]);
    }
    return(<>
    <div className=" relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
    <h1 className="text-[1.5em] mb-[2em]">Conduct a workout</h1>
    {!plans || plans.length==0 &&  
    <div>
        <p>You dont have a training plan. Create it <Link to={'/plans'} className="text-primary font-medium underline decoration-primary/30 hover:decoration-primary transition-all">here</Link></p>
    </div>
    ||
    <div className="flex flex-col items-center">
    <Select onValueChange={handlePlanChange}>Select a plan
  <SelectTrigger className="w-[30vw] " >
    <SelectValue placeholder="Plan" />
  </SelectTrigger>
  <SelectContent position="popper"  className="bg-[#0F1133] text-secondary">
    <SelectGroup>
      {plans?.map((plan:IPlan)=>(
        <SelectItem value={plan.id!.toString()} key={plan.id}>{plan.name}</SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
{selectedPlan &&
<div className="flex flex-col items-center">
  <h1>{selectedPlan.name}</h1>
  {currentWorkout.map((exercise, ind)=>(
    <div>
      {exercise.exerciseId==0 &&
          <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[100%] justify-between dark relative right-2"
            >
              {value
                ? allExercises?.find((ex:IExercisesList) => ex.name === value)?.name
                : "Select an exercise..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 dark">
            <Command>
              <CommandInput placeholder="Search of the exercise..." />
              <CommandEmpty>Not found.</CommandEmpty>
              <CommandGroup>
                {allExercises?.map((ex:IExercisesList, index:number) => (
                  <CommandItem
                    key={index}
                    value={ex.name}
                    onSelect={(currentValue) => { 
                      const newValue = currentValue === value ? "" : currentValue;
                      setValue(newValue);
                      const selectedExercise = allExercises?.find(
                        (ex) => ex.name.toLowerCase() === currentValue.toLowerCase()
                      );
                      if (selectedExercise) {
                        setCurrentWorkout((prev) => {
                          const updatedWorkout = [...prev];
                          updatedWorkout[ind]={...updatedWorkout[ind],name:selectedExercise.name, exerciseId:selectedExercise.id}
                          return updatedWorkout;
                        });
                      }
                    
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === ex.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {ex.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      }
  {exercise.exerciseId!=0 && <ExerciseRow index={ind} edited={currentWorkout} setEdited={setCurrentWorkout} value={exercise} deleteRow={deleteEx}></ExerciseRow>}
  
  </div>
  ))}
</div>
}
<Button onClick={handleRowAdd}>+ Add exercise</Button>

</div>
}
    </div>
    </>
    )
}