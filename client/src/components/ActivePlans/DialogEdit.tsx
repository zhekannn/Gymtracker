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
import { useNavigate } from "react-router-dom"
interface planProps{
    array:IPlan;
    onUpdate: (updatedPlan: IPlan) => void;
}
import { useState,useEffect } from "react"
export default function DialogEdit({ array, onUpdate }: planProps) {
    const [editName, setEditName] = useState(array.name);
    const navigate=useNavigate();
    const [openDialog, setOpenDialog]=useState(false);
    const [exercises, setExersises] = useState<IExercisesList[]>([]);
    const [editExercises, setEditExercises] = useState<IExercise[]>(array.exercises || []);
    const [showAddForm, setShowAddForm] = useState(false);
    function isEqual(array1:IExercise[], array2:IExercise[]){
        if(array1.length!=array2.length) return false;
        for(let i=0;i<array1.length;i++){
            if(array1[i].name!=array2[i].name) return false;
            else if(array1[i].weight!=array2[i].weight) return false;
            else if(array1[i].sets!=array2[i].sets) return false;
            else if(array1[i].reps!=array2[i].reps) return false;
        }
        return true;
    }
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
        if(array.name==editName && isEqual(array.exercises,editExercises)) {
            toast.info("Change atleast anything");
            return;
        }
        try {
            const user=localStorage.getItem('user');
            if(!user) navigate('/login'); 
            const userId=JSON.parse(user!).id;
            const response = await fetch(`/api/plans/${array.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                 },
                
                body: JSON.stringify({
                    name: editName,
                    exercises: editExercises,
                })
                
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate(data.plan || updatedPlan);
                toast.success(data.message);
                setOpenDialog(false);
            }
        } catch (err) {
            toast.error("Failed to update plan");
        }
    };

    const deleteExercise = (index: number) => {
        setEditExercises(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                        <DialogClose>
                            <Button variant="outline" type="button" className="hover:cursor-pointer" onClick={()=> setOpenDialog(false)}>Cancel</Button>
                            
                        </DialogClose>
                        <Button type="submit" className="hover:cursor-pointer bg-green-600 hover:bg-green-400">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}