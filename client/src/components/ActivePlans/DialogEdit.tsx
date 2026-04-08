import { Button } from "@/components/ui/button"
import ExerciseRow from "./ExerciseRow"
  import AddExercise from "./AddExercise"
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
                                <ExerciseRow index={index} edited={editExercises} setEdited={setEditExercises} value={ex} deleteRow={deleteExercise}/>
                            ))}
                        </div>

                        {!showAddForm ? (
                            <Button type="button" variant="secondary" className="w-full text-xs h-8" onClick={() => setShowAddForm(true)}>
                                + Add Exercise
                            </Button>
                        ) : (
                            <AddExercise exercises={exercises} editExercises={editExercises} setEdited={setEditExercises} setShow={setShowAddForm}></AddExercise>
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