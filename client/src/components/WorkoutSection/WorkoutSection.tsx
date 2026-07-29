import { useEffect, useState } from "react";
import { IWorkout, IExercise } from "../../../../shared/types";
import { History, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AlertDialogDelete from "../ActivePlans/AlertDialogDelete";

export default function WorkoutSection() {
  const [trainings, setTrainings] = useState<IWorkout[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const LIMIT = 2;
  async function fetchTrainings(pageNum: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/workouts?page=${pageNum}&limit=${LIMIT}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTrainings((prev) => (pageNum === 1 ? data.workouts : [...prev, ...data.workouts]));
        setHasMore(data.hasMore);
      } else {
        const data = await response.json();
        toast.error(data.message || "Error fetching workouts!");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchTrainings(1);
  }, []);
  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrainings(nextPage);
  }

  async function deleteWorkout(id: number) {
    if (id === 0) {
      toast.error("Invalid training");
      return;
    }
    try {
      const response = await fetch(`/api/deleteWorkout/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTrainings((prev) => prev.filter((value) => Number(value.id) !== Number(id)));
        toast.success(data.message || "Success!");
      } else {
        toast.error(data.message || "Error");
      }
    } catch {
      toast.error("Server error");
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <History className="text-primary" size={20} />
        <h3 className="text-xl font-bold text-white">Training history</h3>
      </div>

      <div className="flex flex-col text-center mt-[2em] w-full">
        {trainings.length === 0 && !loading && (
          <p>
            This list is empty. You don't have any trainings.{" "}
            <Link to="/workouts">
              <Button className="w-[75%] bg-[#0F0011] text-secondary hover:cursor-pointer hover:bg-primary hover:text-black border border-primary h-[2.5em] mt-2">
                Create one
              </Button>
            </Link>
          </p>
        )}

        {trainings.length > 0 && (
          <div className="w-full space-y-4">
            {trainings.map((training: IWorkout) => (
              <div
                key={training.id}
                className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-left w-[100%]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-bold text-primary">
                      {training.planNameSnapshot || "Без названия"}
                    </h4>
                    {training.completedAt && (
                      <span className="text-xs text-slate-400">
                        {new Date(training.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <AlertDialogDelete
                    name="workout"
                    onChange={() => deleteWorkout(training.id || 0)}
                  />
                </div>

                <div className="pl-2 border-l-2 border-slate-700 space-y-1">
                  {training.exercisesSnapshot.map((exercise: IExercise, index: number) => (
                    <div key={`${exercise.name}-${index}`} className="flex justify-between text-sm">
                      <span className="text-slate-300">{exercise.name}</span>
                      <span className="text-slate-500 font-mono">{exercise.sets} sets</span>
                      <span className="text-slate-500 font-mono">{exercise.reps} reps</span>
                      <span className="text-primary font-mono">{exercise.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}