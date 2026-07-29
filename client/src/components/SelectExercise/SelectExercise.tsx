import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IExercisesList } from "../../../../shared/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface ExerciseSelectProps {
  exercises: IExercisesList[];
  selectedId: number | null | undefined;
  onSelect: (exercise: IExercisesList) => void;
  placeholder?: string;
  className?: string;
}

export default function ExerciseSelect({
  exercises,
  selectedId,
  onSelect,
  placeholder = "Select an exercise...",
  className = "",
}: ExerciseSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedExercise = exercises?.find((ex) => ex.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between dark", className)}
        >
          <span className="truncate">
            {selectedExercise ? selectedExercise.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0 dark" align="start">
        <Command>
          <CommandInput placeholder="Search exercise..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {exercises?.map((ex) => (
              <CommandItem
                key={ex.id}
                value={ex.name}
                onSelect={() => {
                  onSelect(ex); 
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === ex.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {ex.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}