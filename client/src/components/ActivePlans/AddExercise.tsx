import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ExerciseSelect from "../SelectExercise/SelectExercise";
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
    const emptyEx: IExercise = { name: "", exerciseId: -1, sets: "0", reps: "0", weight: "0" };
    const [exse, setExse] = useState<IExercise>(emptyEx);
    const addExerciseToPlan = () => {
      if(Number(exse.reps)<=0 || Number(exse.sets)<=0 || Number(exse.weight)<0){
        toast.error("Exercise fields cannot have any zeros");
        return;
      }
      if(editExercises.find(val=>val.exerciseId==exse.exerciseId)) {
        toast.info("You already have this excercise");
        return;
      }
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
                               <ExerciseSelect
        exercises={exercises}
        selectedId={exse.exerciseId}
        onSelect={(selectedEx) => {
          setExse((prev) => ({
            ...prev,
            name: selectedEx.name,
            exerciseId: selectedEx.id,
          }));
        }}
        placeholder="Choose exercise..."
        className="h-8 text-xs"
      />

                                <div className="flex gap-2 items-center justify-center">
                                    <Input className="w-16 h-8 text-center text-xs" type="number" placeholder="Sets" value={exse.sets} onChange={(e) => setExse({ ...exse, sets: (e.target.value) })} />
                                    <span className="text-slate-500">x</span>
                                    <Input className="w-16 h-8 text-center text-xs" type="number" placeholder="Reps" value={exse.reps} onChange={(e) => setExse({ ...exse, reps: (e.target.value) })} />
                                    <Input className="w-20 h-8 text-center text-xs text-primary" type="number" placeholder="kg" value={exse.weight} onChange={(e) => setExse({ ...exse, weight: (e.target.value) })} />
                                    <Button type="button" size="sm" className="h-8" onClick={addExerciseToPlan}>Add</Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setShow(false)}>Cancel</Button>
                                </div>
                            </div>
    )
}