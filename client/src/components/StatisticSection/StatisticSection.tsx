import { ChartNoAxesColumnIncreasing } from "lucide-react"
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { toast } from "sonner";
import { IExerciseStats, IUserStats } from "../../../../shared/types";
export default function StatisticSection() {
    const [exStats, setExStats] = useState<IExerciseStats[] | null>(null);
    const [userStats,setUserStats]=useState<IUserStats | null>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
      async function getStats() {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/");
            return;
          }
  
          const response = await fetch("/api/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const data = await response.json();
  
          if (response.ok) {
            console.log(data);
            setExStats(data.exerciseStats);
            setUserStats(data.userStats);
          } else {
            toast.error(data.message || "Failed to load statistics");
          }
        } catch (err) {
          toast.error("Server error while fetching stats");
        } finally {
          setIsLoading(false);
        }
      }
  
      getStats();
    }, [navigate]);
  
    return (
      <div className="w-full bg-[#0F172A]/60 border border-border/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <ChartNoAxesColumnIncreasing className="text-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Progress</h3>
        </div>
  
        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading stats...</span>
          </div>
        ) : exStats?.length==0 ? (
          <div className="text-slate-400 text-center py-6">
            No statistics available yet. Complete a workout first!
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Сводные карточки */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-border/40">
              <span className="text-xs font-medium text-slate-400">Total Workouts</span>
              <p className="text-2xl font-bold text-white mt-1">{}</p>
            </div>
  
            <div className="bg-slate-900/50 p-4 rounded-xl border border-border/40">
              <span className="text-xs font-medium text-slate-400">Total Volume</span>
              <p className="text-2xl font-bold text-primary mt-1">{} kg</p>
            </div>
  
            {/* Здесь в будущем удобно рендерить графики (например, Recharts или Chart.js) */}
          </div>
        )}
      </div>
    );
  }