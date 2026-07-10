import { Input } from "@/components/ui/input"
import { IExercise } from "../../../../shared/types";
import { Button } from "../ui/button";
interface rowProps{
    index:number;
    edited:IExercise[];
    setEdited(ex:IExercise[]):void;
    value:IExercise;
    deleteRow(index:number):void;
}
export default function ExerciseRow({index,edited, setEdited,value,deleteRow}:rowProps){
    const updateField = (field: keyof IExercise, val: number) => {
        const newEx = [...edited];
        newEx[index] = { ...newEx[index], [field]: val };
        setEdited(newEx);
    };
    return(
        <div key={index} className="grid grid-cols-12 gap-2 items-center bg-[#0F172A] p-2 rounded-md border border-slate-700">
                                    <span className="col-span-4 font-medium text-xs truncate">{value.name}</span>
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs" type="number" value={value.sets} onChange={(e) => {
                                        updateField('sets', Number(e.target.value))
                                    }} />
                                    <span className="col-span-1 text-center text-slate-500 text-xs">x</span>
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs" type="number" value={value.reps} onChange={(e) => {
                                        updateField('reps', Number(e.target.value))
                                    }} />
                                    <Input className="col-span-2 h-7 px-1 text-center text-xs text-primary" type="number" value={value.weight} onChange={(e) => {
                                        updateField('weight', Number(e.target.value))
                                    }} />
                                    <Button type="button" variant="destructive" className="col-span-1 h-7 w-7 p-0 text-red-500 hover:cursor-pointer" onClick={() => deleteRow(index)}>×</Button>
                                </div>
    )
}