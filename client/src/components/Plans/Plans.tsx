import { useState,useEffect } from "react"
import { Plus } from 'lucide-react';
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import ActivePlans from "../ActivePlans/ActivePlans";
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
const exercises = [
    { value: "bench press", label: "Жим лежа" },
    { value: "squats", label: "Приседания" },
    { value: "deadlift", label: "Становая тяга" },
  ]
export default function Plans(){
    const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
    return(
        <>
        <div className="md:flex md:grid-cols-3 w-[100%] content-center">
        <div className=" md:w-[50%] relative flex flex-col items-center bg-[#0F213B] mx-4 p-6 rounded-2xl border-2 border-primary/30 shadow-xl transition-all hover:border-primary/60">
        <div className="flex mb-5">  
            <Plus className="text-primary" size={25}/>
            <p className="text-xl ml-[0.5em]">Create a plan</p>
        </div>
        <div className="flex flex-col items-right items-end">
        <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Plan name
        <input 
              type="text" 
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
          className="w-[100%] justify-between dark"
        >
          {value
            ? exercises.find((ex) => ex.value === value)?.value
            : "Выберите упражнение..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 dark">
        <Command>
          <CommandInput placeholder="Поиск упражнения..." />
          <CommandEmpty>Упражнение не найдено.</CommandEmpty>
          <CommandGroup>
            {exercises.map((ex) => (
              <CommandItem
                key={ex.value}
                value={ex.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === ex.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {ex.value}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
            <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Weight
        <input 
              type="text" 
              id="name"
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
             <label htmlFor="name" className="flex items-center gap-2 text-md font-medium m-2">Reps
        <input 
              type="text" 
              id="name"
              required 
              className="bg-[#0F172A] border border-[#334155] text-[#F8FAFC] rounded-lg p-1 focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 transition-all"
            /></label>
            </div>
        </div>
            <ActivePlans/>
        </div>
        </>
    )
}