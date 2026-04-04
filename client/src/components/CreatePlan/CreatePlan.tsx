import { Plus } from "lucide-react"
import { useState,useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IExercisesList,IExercise } from "../../../../shared/types"
import { IPlan } from "../../../../shared/types"
import { Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
export default function CreatePlan(){
  const navigate=useNavigate();
  const [message, setMessage]=useState(null);
  const [name,setName]=useState('');
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [exercises, setExercises]=useState<IExercisesList[] | null>(null)
    const [exerciseList, setExerciseList]=useState<IExercise[] | null>([])
    const [currentEx, setCurrentEx] = useState<IExercise>({
        exerciseId:0,
        name: '',
        weight: 0, 
        reps: 0,
        sets: 0
      });
    async function getExes() {
        try{
          const response=await fetch('/api/exercises',{
            method:'GET',
            headers:{'Content-type': 'application/json'},
          });
          if(response.ok){
             const data:IExercisesList[]=await response.json();
             setExercises(data);
            }
        }
        catch(err){
          throw err;
        }
      }
    useEffect(()=>{
       getExes();
      },[])
      function handle(){
        if (!value) return alert("Please select an exercise");
        const newExercise: IExercise = {...currentEx, name: value,};
        setExerciseList((prev) => (prev ? [...prev, newExercise] : [newExercise]));
        setValue("");
        setCurrentEx({ exerciseId:0, name: '', weight: 0, reps: 0, sets: 0 });
      }
      async function handleClick(){
        if (!exerciseList || exerciseList.length === 0) {
          return alert('Add at least one exercise!');
        }
        if (!name.trim()) {
          return alert('Please enter a plan name');
        }
        try {
          const userId = localStorage.getItem('user');
          if (!userId) {
            navigate('/login');
            return;
          }
          const userObj = JSON.parse(userId);
          const id = userObj.id;
          const planData:IPlan = {
            name: name,
            exercises: exerciseList,
            userId: id
          };
          const response = await fetch('/api/addplan', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(planData)
          });
          if (response.ok) {
            const data = await response.json();
            setMessage(data.message);
            setExerciseList([]);
            setName('');
            alert("Plan created successfully!");
          } else {
            const errorData = await response.json();
            alert(errorData.message || "Error creating plan");
          }
        } catch (err) {
          console.error("Connection error:", err);
          alert("Server is unreachable");
        }
    }
    return (
        <>
        <div className=" md:w-[50%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        <div className="flex mb-5">  
            <Plus className="text-primary" size={25}/>
            <p className="text-xl ml-[0.5em]">Create a plan</p>
        </div>
        <div className="flex flex-col items-right items-end">
        <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Plan name
        <input 
              type="text" 
              value={name}
              onChange={(e)=>setName(e.target.value)}
              id="name"
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
        <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[80%] justify-between dark relative right-2"
        >
          {value
            ? exercises?.find((ex:IExercisesList) => ex.name === value)?.name
            : "Select an exercise..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 dark">
        <Command>
          <CommandInput placeholder="Search of the exercise..." />
          <CommandEmpty>Упражнение не найдено.</CommandEmpty>
          <CommandGroup>
            {exercises?.map((ex:IExercisesList, index:number) => (
              <CommandItem
                key={index}
                value={ex.name}
                onSelect={(currentValue) => {
                  const newValue = currentValue === value ? "" : currentValue;
                  setValue(newValue);
                  const selectedExercise = exercises?.find(
                    (ex) => ex.name.toLowerCase() === currentValue.toLowerCase()
                  );
                  if (selectedExercise) {
                    setCurrentEx((prev) => ({
                      ...prev,
                      exerciseId: selectedExercise.id,
                      name: selectedExercise.name
                    }));
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
            <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Weight
        <input 
              type="number" 
              id="name"
              value={currentEx.weight}
              onChange={(e)=>setCurrentEx({...currentEx, weight:Number(e.target.value)})}
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
             <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Reps
        <input 
              type="number" 
              id="name"
              value={currentEx.reps}
              onChange={(e)=>setCurrentEx({...currentEx, reps: Number(e.target.value)})}
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
             <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Sets
        <input 
              type="number" 
              id="name"
              value={currentEx.sets}
              onChange={(e)=>setCurrentEx({...currentEx, sets: Number(e.target.value)})}
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
            <Button onClick={handle} className="hover:cursor-pointer hover:bg-[#4ADE80] ">Add to the plan</Button>
            </div>
            <div>
            {exerciseList && 
            exerciseList.map((ex:IExercise, index)=>(
              <div key={index} className="flex gap-4 bg-[#0F172A] p-2 rounded-lg my-1 border border-slate-800">
              <span className="text-primary font-bold">{ex.name}</span>
              <span>{ex.weight}kg</span>
              <span>{ex.sets}x{ex.reps}</span>
              <Button onClick={()=>setExerciseList(exerciseList.filter((val, ind)=>ind!=index))} variant="destructive" size='xs' className="hover:bg-red-500 hover:text-black hover:cursor-pointer"><Trash2 /></Button>
           </div>
            ))}
            {(exerciseList && exerciseList.length>0) && <Button onClick={handleClick} className="hover:cursor-pointer hover:bg-[#4ADE80] ">Create the plan</Button>}
            </div>
        </div>
        </>
    )
}