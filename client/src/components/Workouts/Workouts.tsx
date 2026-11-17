import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { fetchUserPlans } from "@/getPlans"
import { IExercise, IExercisesList, IPlan, IUser, IWorkout } from "../../../../shared/types"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { ChevronsUpDown, Check } from "lucide-react"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "../ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import ExerciseRow from "../ActivePlans/ExerciseRow"
import { API_URL } from '../../api/config';
import { cn } from "@/lib/utils"
export default function Workouts() {
  const [plans, setPlans] = useState<IPlan[] | null>(null);
  const [allExercises, setAllExercises] = useState<IExercisesList[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<IExercise[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [weight, setWeight] = useState<number>(0);
  const exerciseCount = currentWorkout.filter((exercise) => exercise.exerciseId !== 0).length;
  
  const shown = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getPlans() {
      try {
        const data = await fetchUserPlans();
        setPlans(data);
      } catch (err: any) {
        if (!shown.current) {
          toast.error(err.message);
          shown.current = true;
        }
      }
    }
    getPlans();
  }, []);

  function handlePlanChange(planId: string) {
    const plan = plans?.find((p) => p.id === Number(planId));
    if (plan?.name === selectedPlan?.name) {
      setSelectedPlan(null);
      const cleanWork = currentWorkout.filter((el) => !plan?.exercises.includes(el));
      setCurrentWorkout(cleanWork);
      return;
    }
    if (plan) {
      setSelectedPlan(JSON.parse(JSON.stringify(plan)));
      setCurrentWorkout(plan.exercises);
    }
  }

  function deleteEx(index: number) {
    setCurrentWorkout((prev) => prev.filter((_, id) => id !== index));
  }

  async function loadAllExercisesFromDB() {
    if (allExercises) return;

    try {
      const response = await fetch(`${API_URL}/api/exercises`);
      if (response.ok) {
        const data = await response.json();
        setAllExercises(data);
      } else {
        toast.error("Failed to load exercises database");
      }
    } catch (err) {
      toast.error("Server error while fetching exercises");
    }
  }

  async function handleRowAdd() {
    await loadAllExercisesFromDB();
    setCurrentWorkout((prev) => [
      { name: "Choose an exercise", sets: "0", reps: "0", weight: "0", exerciseId: 0 },
      ...prev,
    ]);
  }

  async function handleComplete() {
    const cleanWorkout = currentWorkout.filter((el) => el.exerciseId !== 0);
    const hasInvalidFields = cleanWorkout.some((exercise) => {
      const reps = Number(exercise.reps);
      const sets = Number(exercise.sets);
      const weight = Number(exercise.weight);
    
      const isRepsInvalid = !reps || reps < 1 || Number.isNaN(reps);
      const isSetsInvalid = !sets || sets < 1 || Number.isNaN(sets);
      const isWeightInvalid = weight < 0 || Number.isNaN(weight);
    
      return isRepsInvalid || isSetsInvalid || isWeightInvalid;
    });
    if (hasInvalidFields) {
      return toast.error("Sets and reps must be at least 1, and weight cannot be negative");
    }
    if (cleanWorkout.length === 0) {
      toast.error("Please add at least one valid exercise.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    const user = localStorage.getItem("user");
    if (!user) return;
    const userWeight = JSON.parse(user).weight;

    const newWorkout: IWorkout = {
      exercisesSnapshot: cleanWorkout,
      note: note,
      planId: selectedPlan?.id,
      bodyWeight: weight > 0 ? weight : userWeight,
      planNameSnapshot: selectedPlan?.name || "Quick workout",
    };

    try {
      const response = await fetch(`${API_URL}/api/workouts`, {
        body: JSON.stringify(newWorkout),
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Workout completed!");
        setCurrentWorkout([]);
        setSelectedPlan(null);
        setNote("");
        setWeight(0);

        if (user && weight > 0) {
          const userToChange: IUser = JSON.parse(user);
          userToChange.weight = weight;
          localStorage.setItem("user", JSON.stringify(userToChange));
        }
        navigate("/profile");
      } else {
        toast.error(data.message || "Failed to save workout");
      }
    } catch {
      toast.error("Server error");
    }
  }

  return (
    <div className="relative mx-auto flex w-full min-w-0 max-w-2xl flex-col items-center rounded-2xl border-2 border-primary/30 bg-[#0F213B] p-4 pb-[calc(8rem+env(safe-area-inset-bottom))] shadow-xl transition-all hover:border-primary/60 sm:p-6 sm:pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <h1 className="text-2xl font-bold mb-6 text-white">Conduct a workout</h1>

      {!plans || plans.length === 0 ? (
        <div className="mb-6 text-center text-slate-300">
          <p>
            You don't have a training plan. Create it{" "}
            <Link
              to="/plans"
              className="text-primary font-medium underline decoration-primary/30 hover:decoration-primary transition-all"
            >
              here
            </Link>{" "}
            or just add exercises manually below.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6 w-full max-w-md">
          <Select onValueChange={handlePlanChange} value={selectedPlan?.id?.toString() || ""}>
            <SelectTrigger className="w-full bg-[#0F172A] border-border text-white">
              <SelectValue placeholder="Select a plan (optional)" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-[#0F1133] text-white border-border">
              <SelectGroup>
                {plans?.map((plan: IPlan) => (
                  <SelectItem value={plan.id!.toString()} key={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedPlan && (
        <div className="mb-4 flex w-full max-w-md items-center justify-between gap-3 rounded-lg border border-border bg-slate-900/60 p-3">
          <h2 className="min-w-0 text-base font-semibold wrap-break-word text-white sm:text-lg">{selectedPlan.name}</h2>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0 hover:cursor-pointer"
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
                    className="w-full dark justify-between bg-[#0F172A] text-white border-border hover:bg-[#1E293B]"
                  >
                    {exercise.name !== "Choose an exercise"
                      ? exercise.name
                      : "Select an exercise..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#0F172A] border-border text-white">
                  <Command className="bg-[#0F172A] text-white dark">
                    <CommandInput placeholder="Search exercise..." className="text-white" />
                    <CommandEmpty>Not found.</CommandEmpty>
                    <CommandGroup>
                      {allExercises?.map((ex: IExercisesList) => (
                        <CommandItem
                          key={ex.id}
                          disabled={currentWorkout.find((val)=>val.exerciseId==ex.id) ? true : false}
                          value={ex.name}
                          onSelect={(currentValue) => {
                            if(currentWorkout.find((val)=>val.exerciseId==ex.id)) return;
                            const selectedExercise = allExercises?.find(
                              (item) => item.name.toLowerCase() === currentValue.toLowerCase()
                            );

                            if (selectedExercise) {
                              setCurrentWorkout((prev) => {
                                const updated = [...prev];
                                updated[ind] = {
                                  ...updated[ind],
                                  name: selectedExercise.name,
                                  exerciseId: selectedExercise.id,
                                };
                                return updated;
                              });
                            }
                            setOpenIndex(null);
                          }}
                          className="hover:bg-slate-800 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              exercise.exerciseId === ex.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {ex.name}
                          {currentWorkout.find((val)=>val.exerciseId==ex.id) && <span className="ml-auto text-xs text-slate-500">(Added)</span>}
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

        <div className="w-full max-w-md bg-slate-900/50 p-4 rounded-xl border border-border/50 space-y-3 mt-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-xs font-medium text-slate-400">
              Workout note
            </label>
            <input
              id="note"
              type="text"
              placeholder="Felt energetic, good focus..."
              className="bg-[#0F172A] border border-border text-white rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="body" className="text-xs font-medium text-slate-400">
              Current bodyweight (kg)
            </label>
            <input
              id="body"
              type="number"
              placeholder="0"
              value={weight || ""}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0) setWeight(val);
              }}
              className="bg-[#0F172A] border border-border text-white rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              name="body"
            />
          </div>
        </div>
      </div>
      <div
        role="group"
        aria-label="Workout actions"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-2xl rounded-t-2xl border border-slate-700/80 bg-[#020617]/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(2,6,23,0.35)] backdrop-blur-md sm:px-6"
      >
        <div className="mx-auto w-full max-w-md">
          <p className="mb-2 text-xs font-medium text-slate-400" aria-live="polite">
            {exerciseCount > 0
              ? `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"} in this workout`
              : "Add exercises to get started"}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={handleRowAdd}
              variant="outline"
              className={cn("h-11 min-w-0 cursor-pointer px-2 leading-tight whitespace-normal hover:text-black", currentWorkout.length === 0 && "col-span-2")}
            >
              + Add exercise
            </Button>
            {currentWorkout.length > 0 && (
              <Button
                type="button"
                onClick={handleComplete}
                variant="default"
                className="h-11 min-w-0 cursor-pointer px-2 font-semibold leading-tight whitespace-normal hover:bg-primary-hover"
              >
                Complete workout
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
