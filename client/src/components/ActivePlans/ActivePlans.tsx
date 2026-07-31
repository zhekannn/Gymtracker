import { FileText } from "lucide-react"
import { IPlan, IExercise } from "../../../../shared/types"
import AlertDialogDelete from "./AlertDialogDelete";
import DialogEdit from "./DialogEdit";

interface ActivePlansProps {
  plans: IPlan[];
  onDelete(id: number): void;
  onUpdatePlan(id: number, plan: IPlan): void;
}

export default function ActivePlans({ plans, onDelete, onUpdatePlan }: ActivePlansProps) {
  return (
    <div className="w-full bg-[#0F213B] border border-border/50 hover:border-primary/60 p-6 rounded-2xl shadow-xl transition-all text-white space-y-6">
      {/* Шапка блока */}
      <div className="flex items-center gap-2.5">
        <FileText className="text-primary" size={24} />
        <h3 className="text-xl font-bold">Your active plans</h3>
      </div>

      {/* Пустое состояние */}
      {(!plans || plans.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-700/60 rounded-xl bg-[#1E293B]/20">
          <p className="text-slate-400 text-base font-medium">This list is empty</p>
          <p className="text-slate-500 text-xs mt-1">Create a plan or generate one with AI</p>
        </div>
      )}

      {/* Сетка планов (1 колонка на экранах поменьше, 2 колонки на десктопе) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className="w-full p-4 bg-[#1E293B]/60 rounded-xl border border-border/40 hover:border-border/80 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Название и экшены */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/40">
                <h4 className="text-lg font-bold text-primary truncate max-w-[180px]">
                  {plan.name}
                </h4>
                <div className="flex items-center gap-1">
                  <AlertDialogDelete name="plan" onChange={() => onDelete(plan.id!)} />
                  <DialogEdit array={plan} onUpdate={(editPlan) => onUpdatePlan(plan.id!, editPlan)} />
                </div>
              </div>

              {/* Список упражнений */}
              <div className="space-y-2">
                {plan.exercises?.map((ex: IExercise, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm bg-[#0F172A]/90 p-2.5 rounded-lg border border-slate-800"
                  >
                    <span className="font-medium text-slate-200 truncate max-w-[130px]" title={ex.name}>
                      {ex.name}
                    </span>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <span>{ex.sets || 0} × {ex.reps || 0}</span>
                      <span className="text-primary font-mono font-semibold">{ex.weight || 0} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}