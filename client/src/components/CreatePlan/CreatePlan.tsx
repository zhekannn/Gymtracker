import { useState, useEffect } from "react";
import { Plus, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IExercisesList, IExercise, IPlan } from "../../../../shared/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface planProp {
  onPlanChange: (message: string, plan?: IPlan) => void;
}

export default function CreatePlan({ onPlanChange }: planProp) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<IExercisesList[]>([]);
  const [exerciseList, setExerciseList] = useState<IExercise[]>([]);
  const [selectedIds, setSelectedIds]=useState<Number[]>([]);
  const [currentEx, setCurrentEx] = useState<IExercise>({
    exerciseId: 0,
    name: '',
    weight: '' as any, 
    reps: '' as any,
    sets: '' as any
  });

  async function getExes() {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data: IExercisesList[] = await response.json();
        setExercises(data);
      }
    } catch (err) {
      console.error("Failed to load exercises", err);
    }
  }

  useEffect(() => {
    getExes();
  }, []);
  function handleAddExercise() {
    if (!value) return toast.info("Please select an exercise");

    const isAlreadyAdded = exerciseList.some((val) => val.name === value);
    if (isAlreadyAdded) return toast.warning("You already have this exercise in your list");

    const selectedObj = exercises.find((ex) => ex.name === value);
    if(Number(currentEx.reps)<=0 || Number(currentEx.sets)<=0 || Number(currentEx.weight)<0) return toast.error("Invalid data in exercise fields");
    const newExercise: IExercise = {
      ...currentEx,
      exerciseId: selectedObj ? selectedObj.id : 0,
      name: value,
    };

    setExerciseList((prev) => [...prev, newExercise]);
    setValue("");
    setSelectedIds(prev=>[...prev, newExercise.exerciseId]);
    setCurrentEx({ exerciseId: 0, name: '', weight: '' as any, reps: '' as any, sets: '' as any });
  }

  function handleRemoveExercise(indexToRemove: number) {
    setExerciseList((prev) => prev.filter((ex, index) => ex.exerciseId !== indexToRemove));
    setSelectedIds(prev=>prev.filter((val)=>val!=indexToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error('Please enter a plan name');
    }

    if (!exerciseList || exerciseList.length === 0) {
      return toast.error('Add at least one exercise to the plan!');
    }

    try {
      const userId = localStorage.getItem('user');
      if (!userId) {
        navigate('/login');
        return;
      }
      const userObj = JSON.parse(userId);
      const id = userObj.id;

      const planData: IPlan = {
        name: name,
        exercises: exerciseList,
        userId: id
      };

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const data = await response.json();
        onPlanChange(data.message, data.plan);
        setExerciseList([]);
        setSelectedIds([]);
        setCurrentEx({   exerciseId: 0,
          name: '',
          weight: '' as any, 
          reps: '' as any,
          sets: '' as any});
        setName('');
        toast.success("Plan created successfully!");
      } else {
        const errorData = await response.json();
        onPlanChange(errorData.message || "Server error occurred");
      }
    } catch (err) {
      console.error("Connection error:", err);
      onPlanChange("Server error");
    }
  }

  return (
    <div className="bg-[#0F213B] hover:border-primary/60 border border-border/50 rounded-2xl p-6 shadow-xl space-y-6 text-white">
  {/* Крупный заголовок */}
  <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
    <Plus className="text-primary" size={24} />
    Create a plan
  </h3>

  <div className="space-y-5">
    {/* Plan Name */}
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-200">Plan name</label>
      <Input
        type="text"
        placeholder="e.g. Chest & Triceps"
        className="w-full bg-slate-900/80 border-border/40 text-white text-sm h-11 focus-visible:ring-primary px-3.5"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    {/* Exercise Select */}
    <div className="flex flex-col gap-2">
  <label className="text-sm font-semibold text-slate-200">Exercise</label>
  <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between dark bg-slate-900/80 border-border/40 text-sm h-11 px-3.5 text-slate-200 hover:bg-slate-800 hover:text-white"
      >
        <span className="truncate">
          {value
            ? exercises.find((ex) => ex.name === value)?.name
            : "Select an exercise..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent 
      align="start" 
      sideOffset={4}
      className="w-[--radix-popover-trigger-width] p-0 bg-slate-900 border-border/40 dark"
    >
      <Command>
        <CommandInput placeholder="Search exercise..." className="h-10 text-sm" />
        <CommandList className="max-h-[220px] min-h-[100px] overflow-y-auto">
          <CommandEmpty className="py-6 text-center text-sm text-slate-400">
            No exercise found.
          </CommandEmpty>
          <CommandGroup>
            {exercises.map((ex) => {
              const isAlreadyAdded = selectedIds.includes(ex.id);
             return( <CommandItem
                key={ex.id}
                disabled={isAlreadyAdded}
                value={ex.name} 
                onSelect={(currentValue) => {
                  if (isAlreadyAdded) return;
                  setValue(currentValue === value.toLowerCase() ? "" : ex.name);
                  setOpen(false);
                }}
                className={cn(
                  "text-sm py-2.5 cursor-pointer",
                  isAlreadyAdded && "opacity-40 cursor-not-allowed"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-primary",
                    value === ex.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {ex.name}
                {isAlreadyAdded && <span className="ml-auto text-xs text-slate-500">(Added)</span>}
              </CommandItem>
)})}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>

    {/* Weight / Reps / Sets */}
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-200">Weight</label>
        <Input
          type="number"
          placeholder="kg"
          className="w-full bg-slate-900/80 border-border/40 text-white text-sm text-center h-11"
          value={currentEx.weight}
          onChange={(e) => setCurrentEx({ ...currentEx, weight: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-200">Reps</label>
        <Input
          type="number"
          placeholder="count"
          className="w-full bg-slate-900/80 border-border/40 text-white text-sm text-center h-11"
          value={currentEx.reps}
          onChange={(e) => setCurrentEx({ ...currentEx, reps: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-200">Sets</label>
        <Input
          type="number"
          placeholder="count"
          className="w-full bg-slate-900/80 border-border/40 text-white text-sm text-center h-11"
          value={currentEx.sets}
          onChange={(e) => setCurrentEx({ ...currentEx, sets: e.target.value })}
        />
      </div>
    </div>

    {/* Кнопка добавления упражнения */}
    <Button
      type="button"
      onClick={handleAddExercise}
      variant="outline"
      className="w-full hover:cursor-pointer hover:bg-slate-800 text-slate-200 text-sm h-10 border border-border/40 font-medium"
    >
      + Add Exercise
    </Button>

    {/* Список добавленных упражнений */}
    {exerciseList.length > 0 && (
      <div className="space-y-2.5 pt-3 border-t border-border/30">
        <span className="text-sm font-semibold text-slate-400">Added exercises:</span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {exerciseList.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-border/30 text-sm"
            >
              <span className="font-medium text-slate-200 truncate max-w-[160px]">{ex.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-primary font-mono text-xs font-semibold">
                  {ex.sets || 0}×{ex.reps || 0} ({ex.weight || 0}kg)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(ex.exerciseId)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Главная кнопка сохранения */}
    <Button
      type="button"
      onClick={handleSubmit}
      className="w-full bg-primary hover:bg-primary-hover text-slate-950 font-bold h-11 text-base mt-2 hover:cursor-pointer transition-all"
    >
      Save Full Plan
    </Button>
  </div>
</div>
  );
}