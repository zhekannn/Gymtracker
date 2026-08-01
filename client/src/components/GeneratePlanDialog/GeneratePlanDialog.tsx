import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IGeneratePlanInfo, IPlan, IUser } from "../../../../shared/types";
import { getAge } from "../../getAge";

interface GenerateAiPlanDialogProps {
  onPlanGenerated: (serverMessage: string, newPlan?: IPlan) => void;
}

export default function GenerateAiPlanDialog({ onPlanGenerated }: GenerateAiPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<string>("muscle_gain");
  const [daysCount, setDaysCount] = useState<number>(3);
  const [experience, setExperience] = useState<string>("beginner");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user=localStorage.getItem('user');
      if(!user) return;
      const userData:IUser=JSON.parse(user);
      const weight=userData.weight;
      const height=userData.height;
      const age=getAge(userData.birthDate);
      const response = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          goal,
          daysCount,
          experience,
          additionalNotes,
          age,
          weight,
          height
        } as IGeneratePlanInfo),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("AI plan successfully generated!");
        onPlanGenerated("Plan created via AI", data.plan);
        setOpen(false);
      } else {
        toast.error(data.message || "Failed to generate plan");
      }
    } catch (err) {
      toast.error("Server error during AI generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 gap-2 hover:cursor-pointer transition-all">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          Generate with AI
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-border/50 text-white dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="text-primary w-5 h-5" />
            AI Workout Plan Generator
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Specify your goals and preferences, and AI will generate a tailored workout plan for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4 mt-2">
          {/* 1. Цель */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Fitness Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="muscle_gain">Build Muscle (Hypertrophy)</option>
              <option value="strength">Increase Strength</option>
              <option value="weight_loss">Fat Loss & Conditioning</option>
              <option value="endurance">Endurance & Health</option>
            </select>
          </div>

          {/* 2. Количество дней в неделю и Опыт */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Days per week</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="h-9 text-xs bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* 3. Дополнительные пожелания */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Additional Notes <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Focus on chest, avoid knee pain exercises..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full h-20 rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Кнопка отправки */}
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="bg-primary hover:bg-primary-hover text-slate-950 font-bold text-xs gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}