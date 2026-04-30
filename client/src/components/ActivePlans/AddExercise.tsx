import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"
  import { IExercise, IExercisesList } from "../../../../shared/types";
  import { useState } from "react";
  import { toast } from "sonner";
  interface addExProps{
    exercises:IExercisesList[];
    editExercises:IExercise[];
    setEdited(ex:IExercise[]):void;
    setShow(state:boolean):void;
  }
export default function AddExercise({exercises,editExercises,setEdited,setShow}:addExProps){
    const emptyEx: IExercise = { name: "", exerciseId: -1, sets: 0, reps: 0, weight: 0 };
    const [exse, setExse] = useState<IExercise>(emptyEx);
    const [open, setOpen] = useState(false);
    const addExerciseToPlan = () => {
        if (!exse.name) {
            toast.error("Please select an exercise first");
            return;
        }
        setEdited([...editExercises, exse]);
        setExse(emptyEx);
        setShow(false);
    };
    return(
        <div className="p-3 border border-dashed border-slate-600 rounded-lg space-y-3 bg-slate-900/50">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between text-xs h-8">
                                            {exse.name || "Choose exercise..."}
                                            <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[280px] p-0 dark">
                                        <Command>
                                            <CommandInput placeholder="Search..." />
                                            <CommandEmpty>No results</CommandEmpty>
                                            <CommandGroup className="max-h-[150px] overflow-y-auto">
                                                {exercises.map((ex) => (
                                                    <CommandItem key={ex.id} onSelect={() => {
                                                        setExse({ ...exse, name: ex.name, exerciseId: ex.id });
                                                        setOpen(false);
                                                    }}>
                                                        <Check className={cn("mr-2 h-3 w-3", exse.name === ex.name ? "opacity-100" : "opacity-0")} />
                                                        {ex.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                <div className="flex gap-2 items-center justify-center">
                                    <Input className="w-16 h-8 text-center text-xs" type="number" placeholder="Sets" value={exse.sets} onChange={(e) => setExse({ ...exse, sets: Number(e.target.value) })} />
                                    <span className="text-slate-500">x</span>
                                    <Input className="w-16 h-8 text-center text-xs" type="number" placeholder="Reps" value={exse.reps} onChange={(e) => setExse({ ...exse, reps: Number(e.target.value) })} />
                                    <Input className="w-20 h-8 text-center text-xs text-primary" type="number" placeholder="kg" value={exse.weight} onChange={(e) => setExse({ ...exse, weight: Number(e.target.value) })} />
                                    <Button type="button" size="sm" className="h-8" onClick={addExerciseToPlan}>Add</Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setShow(false)}>Cancel</Button>
                                </div>
                            </div>
    )
}