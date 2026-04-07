import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { IPlan } from "../../../../shared/types"
import { IExercise } from "../../../../shared/types"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { IExercisesList } from "../../../../shared/types"
interface planProps{
    array:IPlan;
    onUpdate: (updatedPlan: IPlan) => void;
}
import { useState,useEffect } from "react"
export default function DialogEdit({ array, onUpdate }: planProps) {
    const [editName, setEditName] = useState(array.name);
    const [openDialog, setOpenDialog]=useState(false);
    const [exercises, setExersises] = useState<IExercisesList[]>([]);
    const [editExercises, setEditExercises] = useState<IExercise[]>(array.exercises || []);
    const emptyEx: IExercise = { name: "", exerciseId: -1, sets: 0, reps: 0, weight: 0 };
    const [exse, setExse] = useState<IExercise>(emptyEx);
    const [open, setOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    useEffect(() => {
        async function getExes() {
            try {
                const response = await fetch("/api/exercises");
                const data = await response.json();
                setExersises(data || []);
            } catch (e) {
                toast.error("Could not load exercises list");
            }
        }
        getExes();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedPlan: IPlan = { ...array, name: editName, exercises: editExercises };

        try {
            const response = await fetch(`/api/plans/${array.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    exercises: editExercises
                })
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate(data.plan || updatedPlan);
                toast.success("Plan updated successfully");
            }
        } catch (err) {
            toast.error("Failed to update plan");
        }
    };

    const addExerciseToPlan = () => {
        if (!exse.name) {
            toast.error("Please select an exercise first");
            return;
        }
        setEditExercises([...editExercises, exse]);
        setExse(emptyEx);
        setShowAddForm(false);
    };

    const deleteExercise = (index: number) => {
        setEditExercises(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={openDialog}>
            <DialogTrigger asChild>
                <Button onClick={()=>setOpenDialog(true)} variant="outline" size='icon-sm' className="hover:bg-primary hover:text-black hover:cursor-pointer"><Edit size={16}/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md dark">
                <form onSubmit={handleSave}>
                    <DialogHeader>
                        <DialogTitle>Edit plan</DialogTitle>
                        <DialogDescription>Modify exercises and plan name.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="planName text-xs">Plan name</Label>
                            <Input id="planName" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                            <Label className="text-xs text-slate-400">Current Exercises</Label>
                            {editExercises.map((ex, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-[#0F172A] p-2 rounded-md border border-slate-700">
                                    <span className="col-span-4 font-medium text-xs truncate">{ex.name}</span>
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs" type="number" value={ex.sets} onChange={(e) => {
                                        const newEx = [...editExercises];
                                        newEx[index].sets = Number(e.target.value);
                                        setEditExercises(newEx);
                                    }} />
                                    <span className="col-span-1 text-center text-slate-500 text-xs">x</span>
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs" type="number" value={ex.reps} onChange={(e) => {
                                        const newEx = [...editExercises];
                                        newEx[index].reps = Number(e.target.value);
                                        setEditExercises(newEx);
                                    }} />
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs text-primary" type="number" value={ex.weight} onChange={(e) => {
                                        const newEx = [...editExercises];
                                        newEx[index].weight = Number(e.target.value);
                                        setEditExercises(newEx);
                                    }} />
                                    <Button type="button" variant="ghost" className="col-span-1 h-7 w-7 p-0 text-red-500" onClick={() => deleteExercise(index)}>×</Button>
                                </div>
                            ))}
                        </div>

                        {!showAddForm ? (
                            <Button type="button" variant="secondary" className="w-full text-xs h-8" onClick={() => setShowAddForm(true)}>
                                + Add Exercise
                            </Button>
                        ) : (
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
                                    <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" onClick={()=>setOpenDialog(false)}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={()=>setOpenDialog(false)}>Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}