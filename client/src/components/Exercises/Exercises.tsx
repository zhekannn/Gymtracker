import { useEffect, useState } from "react";
import { getExes } from "../GetExercises";
import { IExercisesList } from "../../../../shared/types";
import { toast } from "sonner";
import { Loader2, Dumbbell, Search } from "lucide-react";

export default function Exercises() {
  const [exercises, setExercises] = useState<IExercisesList[] | null>(null);
//   const [search, setSearch] = useState("");
  const [filtered, setFiltered]=useState<IExercisesList[]>([]);
  async function fetchExercises() {
    try {
      const data = await getExes();
      setExercises(data);
      setFiltered(data);
    } catch (err) {
      toast.error("Failed to fetch exercises");
    }
  }

  useEffect(() => {
    fetchExercises();
  }, []);

  // Фильтрация по поисковому запросу
  function searchExes(value:string){
    if(filtered) setFiltered(exercises!.filter((val:IExercisesList)=>val.name.toLowerCase().includes(value.toLowerCase())));
  }


  if (!exercises) {
    return (
      <div className="flex items-center justify-center gap-6 h-[75vh]">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Заголовок и поиск */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Exercises Library</h1>
          <p className="text-slate-400 text-sm mt-1">Explore exercises with proper form and instructions</p>
        </div>

        {/* Поисковая строка */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            onChange={(e) => searchExes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Сетка упражнений */}
      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Контейнер для картинки / плейсхолдера */}
              <div className="h-48 w-full bg-slate-950 flex items-center justify-center relative border-b border-slate-800/80">
                {exercise.imageUrl ? (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  /* Плейсхолдер, пока картинки нет в БД */
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Dumbbell className="size-12 stroke-[1.5]" />
                    <span className="text-xs">No image preview</span>
                  </div>
                )}
                
                {/* Категория / Группа мышц (если есть в типе) */}
                {exercise.muscleGroup && (
                  <span className="absolute top-3 right-3 bg-slate-800/90 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700/50 backdrop-blur-sm">
                    {exercise.muscleGroup}
                  </span>
                )}
              </div>

              {/* Описание и текст */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {exercise.description || "No description provided for this exercise."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Пустое состояние */
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl">
          <Dumbbell className="size-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-slate-300 font-medium">No exercises found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search filter</p>
        </div>
      )}
    </div>
  );
}