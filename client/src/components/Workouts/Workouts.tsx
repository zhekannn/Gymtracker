import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { fetchUserPlans } from "@/getPlans"
import { IExercise, IExercisesList, IPlan, IWorkout } from "../../../../shared/types"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { ChevronsUpDown, Check } from "lucide-react"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "../ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import ExerciseRow from "../ActivePlans/ExerciseRow"
import { cn } from "@/lib/utils"

export default function Workouts() {
  const [plans, setPlans] = useState<IPlan[] | null>(null)
  const [allExercises, setAllExercises] = useState<IExercisesList[] | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null)
  const [currentWorkout, setCurrentWorkout] = useState<IExercise[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [note,setNote]=useState("");
  const shown = useRef(false)

  useEffect(() => {
    async function getPlans() {
      try {
        const data = await fetchUserPlans()
        setPlans(data)
      } catch (err: any) {
        if (!shown.current) {
          toast.error(err.message)
          shown.current = true
        }
      }
    }
    getPlans()
  }, [])

  function handlePlanChange(planId: string) {
    const plan = plans?.find((p) => p.id === Number(planId))
    if(plan?.name==selectedPlan?.name){
      setSelectedPlan(null);
      const cleanWork=currentWorkout.filter(el=>!plan?.exercises.includes(el));
      setCurrentWorkout(cleanWork);
    }
    if (plan) {
      setSelectedPlan(JSON.parse(JSON.stringify(plan)))
      setCurrentWorkout(plan.exercises)
    }
  }

  function deleteEx(index: number) {
    setCurrentWorkout((prev) => prev.filter((_, id) => id !== index))
  }

  async function loadAllExercisesFromDB() {
    if (allExercises) return

    try {
      const response = await fetch("/api/exercises")
      if (response.ok) {
        const data = await response.json()
        setAllExercises(data)
      } else {
        toast.error("Failed to load exercises database")
      }
    } catch (err) {
      toast.error("Server error while fetching exercises")
    }
  }

  async function handleRowAdd() {
    await loadAllExercisesFromDB()
    setCurrentWorkout((prev) => [
      { name: "Choose an exercise", sets: "0", reps: "0", weight: "0", exerciseId: 0 },
      ...prev,
    ])
  }

  async function handleComplete() {
    const cleanWorkout = currentWorkout.filter((el) => el.exerciseId !== 0)
    if (cleanWorkout.length === 0) {
      toast.error("Please add at least one valid exercise.");
      return;
    }
    setCurrentWorkout(cleanWorkout);
    const token=localStorage.getItem('token');
    if ( !token) {
      toast.error("User not authenticated");
      return;
    }
      const newWorkout:IWorkout={exercisesSnapshot:cleanWorkout, note:note, planId:selectedPlan?.id, planNameSnapshot:selectedPlan?.name || "Quick workout"}
      try{
    const response=await fetch(`/api/workout`, {
      body:JSON.stringify(newWorkout),
      method:"POST",
      headers:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
      }
    });
    const data = await response.json();
    if(response.ok){
      toast.success(data.message,{style:{"width":"30vw"}});
      setCurrentWorkout([]);
      setSelectedPlan(null);
    }
    else{
      toast.error(data.message || "Failed to save workout");
    }
  }
  catch{
      toast.error("Server error");
}
  }
  return (
    <div className="relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
      <h1 className="text-[1.5em] mb-[2em]">Conduct a workout</h1>

      {!plans || plans.length === 0 ? (
        <div className="mb-4">
          <p>
            You don't have a training plan. Create it{" "}
            <Link
              to={"/plans"}
              className="text-primary font-medium underline decoration-primary/30 hover:decoration-primary transition-all"
            >
              here
            </Link>{" "}
            or just add exercises manually below.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <Select onValueChange={handlePlanChange} value={selectedPlan?.id?.toString() || ""}>
            <SelectTrigger className="w-[30vw]">
              <SelectValue placeholder="Select a plan (optional)" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-[#0F1133] text-secondary">
              <SelectGroup>
                {plans?.map((plan: IPlan) => (
                  <SelectItem value={plan.id!.toString()} key={plan.id} onClick={()=>handlePlanChange(plan.id!.toString())}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    {selectedPlan && (
  <div className="flex items-center gap-4 mb-4">
    <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        const planExerciseIds = new Set(selectedPlan.exercises.map((ex) => ex.exerciseId));
        const customExercisesOnly = currentWorkout.filter(
          (ex) => !planExerciseIds.has(ex.exerciseId)
        );
        setCurrentWorkout(customExercisesOnly);
        setSelectedPlan(null);
      }}
    >
      Remove Plan
    </Button>
  </div>
)}

      <div className="w-full flex flex-col items-center gap-3">
        {currentWorkout.map((exercise, ind) => (
          <div key={ind} className="w-full max-w-md">
            {exercise.exerciseId === 0 ? (
              <Popover
                open={openIndex === ind}
                onOpenChange={(isOpen) => setOpenIndex(isOpen ? ind : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openIndex === ind}
                    className="w-full justify-between dark"
                  >
                    {exercise.name !== "Choose an exercise"
                      ? exercise.name
                      : "Select an exercise..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 dark">
                  <Command>
                    <CommandInput placeholder="Search exercise..." />
                    <CommandEmpty>Not found.</CommandEmpty>
                    <CommandGroup>
                      {allExercises?.map((ex: IExercisesList) => (
                        <CommandItem
                          key={ex.id}
                          value={ex.name}
                          onSelect={(currentValue) => {
                            const selectedExercise = allExercises?.find(
                              (item) => item.name.toLowerCase() === currentValue.toLowerCase()
                            )

                            if (selectedExercise) {
                              setCurrentWorkout((prev) => {
                                const updated = [...prev]
                                updated[ind] = {
                                  ...updated[ind],
                                  name: selectedExercise.name,
                                  exerciseId: selectedExercise.id,
                                }
                                return updated
                              })
                            }
                            setOpenIndex(null)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              exercise.exerciseId === ex.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {ex.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <ExerciseRow
                index={ind}
                edited={currentWorkout}
                setEdited={setCurrentWorkout}
                value={exercise}
                deleteRow={deleteEx}
              />
            )}
          </div>
        ))}
        <div className="flex gap-4 mt-4">
          <Button onClick={handleRowAdd}>+ Add exercise</Button>
          <div>
            <label htmlFor="note">Note</label>
            <input type="text" className="bg-[#0F172A] border border-border text-white rounded-lg p-1 focus:border-primary outline-none" name="note" value={note} onChange={(event)=>setNote(event.target.value)}/>
          </div>
          {currentWorkout.length > 0 && (
            <Button onClick={handleComplete} variant="default">
              Complete workout
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}