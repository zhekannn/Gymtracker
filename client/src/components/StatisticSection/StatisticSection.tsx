import { ChartNoAxesColumnIncreasing, Loader2, Dumbbell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IExercisesList, IExerciseStats, IUserStats } from "../../../../shared/types";
import { Button } from "../ui/button";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import ExerciseSelect from "../SelectExercise/SelectExercise";
type TabType = "general" | "exercises";
export default function StatisticSection() {
    const [exStats, setExStats] = useState<IExerciseStats[] | null>(null);
    const [userStats,setUserStats]=useState<IUserStats | null>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [showGraph,setShowGraph]=useState(false);
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
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
        {/* Шапка секции и Табы */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ChartNoAxesColumnIncreasing className="text-primary" size={20} />
            <h3 className="text-xl font-bold text-white">Progress</h3>
          </div>
  
          {/* Переключатель Табов */}
          <div className="flex p-1 bg-slate-900/80 rounded-xl border border-border/40">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex hover:cursor-pointer items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "general"
                  ? "bg-primary text-slate-950 font-semibold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User size={16} />
              General
            </button>
  
            <button
              onClick={() => setActiveTab("exercises")}
              className={`flex hover:cursor-pointer items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "exercises"
                  ? "bg-primary text-slate-950 font-semibold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Dumbbell size={16} />
              Exercises
            </button>
          </div>
        </div>
  
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading stats...</span>
          </div>
        ) : exStats?.length === 0 ? (
          <div className="text-slate-400 text-center py-12 border border-dashed border-border/40 rounded-xl">
            No statistics available yet. Complete a workout first!
          </div>
        ) : (
          <div>
            {/* ВКЛАДКА 1: GENERAL STATS */}
            {activeTab === "general" && userStats && (
              <div className="space-y-6 flex flex-col text-center">
                {/* Карточки с метриками */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-border/40">
                    <span className="text-xs font-medium text-slate-400">Total Workouts</span>
                    <p className="text-2xl font-bold text-white mt-1">{userStats.totalWorkouts || 0}</p>
                  </div>
  
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-border/40">
                    <span className="text-xs font-medium text-slate-400">Workouts This Month</span>
                    <p className="text-2xl font-bold text-white mt-1">{userStats.workoutsInMonth || 0}</p>
                  </div>
  
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-border/40">
                    <span className="text-xs font-medium text-slate-400">Volume This Month</span>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {userStats.totalWeightInMonth?.toLocaleString() || 0} kg
                    </p>
                  </div>
                </div>
                <Button className="hover:cursor-pointer items-center justify-center" onClick={()=>setShowGraph((prev)=>!prev)}>{showGraph ? "Hide graphics" : "Show graphics"}</Button>
                {showGraph && <>
                {/* График 1: Объем за тренировки (Volume Per Workout) */}
                <div className="bg-slate-900/50 p-5 rounded-xl border border-border/40">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Volume per Workout (kg)</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userStats.totalWeightPerWorkout}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }}
                          itemStyle={{ color: "#22C55E" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Volume" 
                          stroke="#22C55E" 
                          strokeWidth={2.5} 
                          dot={{ fill: "#22C55E", r: 4 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
  
                {/* График 2: Прогресс веса тела (Body Weight Progress) */}
                {userStats.progress && userStats.progress.length > 0 && (
                  <div className="bg-slate-900/50 p-5 rounded-xl border border-border/40">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Body Weight History (kg)</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userStats.progress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }}
                            itemStyle={{ color: "#38BDF8" }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Weight" 
                            stroke="#38BDF8" 
                            strokeWidth={2.5} 
                            dot={{ fill: "#38BDF8", r: 4 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}</>}
                
              </div>
            )}
  
            {/* ВКЛАДКА 2: EXERCISES STATS */}
            {activeTab === "exercises" && (
              <div className="text-slate-400 py-6 text-center">
                {/* Тут сделаем селект упражнения и его графики */}
                {exStats && <ExerciseSelect exercises={exStats?.map((ex)=>ex.exercise)} selectedId={selectedExerciseId} onSelect={(ex) => setSelectedExerciseId(ex.id)
                }></ExerciseSelect>}
                {selectedExerciseId && exStats &&  <div className="h-64 w-full mt-4"><ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exStats[selectedExerciseId-1].progress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(str) => {
    const date = new Date(str);
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }}/>
                          <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }}
                            itemStyle={{ color: "#38BDF8" }} labelFormatter={(label:any) => {
                              if (!label) return "";
                              const date = new Date(label);
                              return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            name="Weight" 
                            stroke="#22C55E" 
                            strokeWidth={2.5} 
                            dot={{ fill: "##22C55E", r: 4 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer></div>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }