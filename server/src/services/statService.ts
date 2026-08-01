import { MoreThanOrEqual } from "typeorm";
import { IUserStats, IExerciseStats, IStatPoint, IExercisesList } from "../../../shared/types.js";
import { AppDataSource } from "../data-source.js";
import { Workout } from "../entities/Workout.js";
import { Exercise } from "../entities/Exercise.js";

export class StatService {
  private workoutRepo = AppDataSource.getRepository(Workout);
  private exRepo = AppDataSource.getRepository(Exercise);

  /**
   * Helper для нормализации даты в красивую локальную строку
   * @param date - объект Date или строка
   * @param includeTime - включать ли время (ЧЧ:ММ)
   */
  private formatDate(date: Date | string, includeTime: boolean = false): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
  
    if (!includeTime) {
      return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "numeric" });
    }
  
    // Используем toLocaleString для корректного форматирования с временем
    const datePart = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year:"2-digit"});
    const timePart = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  
    return `${datePart} ${timePart}`;
  }

  public async getUserStats(userId: number): Promise<IUserStats> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const workouts = await this.workoutRepo.find({
      where: {
        userId: userId,
        completedAt: MoreThanOrEqual(oneMonthAgo),
      },
      order: {
        completedAt: "ASC",
      },
    });

    let totalWeightInMonth = 0;
    const weightPerDayMap = new Map<string, number>();
    const bodyWeightMap = new Map<string, number>();

    for (const workout of workouts) {
      // Для общего веса тела и тоннажа за день берем дату БЕЗ времени ("01.08")
      const dayKey = this.formatDate(workout.completedAt, true);

      let workoutVolume = workout.exercisesSnapshot.reduce((acc, ex) => {
        const sets = Number(ex.sets) || 0;
        const reps = Number(ex.reps) || 0;
        const weight = Number(ex.weight) || 0;
        return acc + sets * reps * weight;
      }, 0);
      workoutVolume=workoutVolume/1000;
      totalWeightInMonth += workoutVolume;

      // Накапливаем тоннаж за день
      const currentDayVolume = weightPerDayMap.get(dayKey) || 0;
      weightPerDayMap.set(dayKey, currentDayVolume + workoutVolume);

      // Записываем вес тела за этот день
      if (workout.bodyWeight && workout.bodyWeight > 0) {
        bodyWeightMap.set(dayKey, workout.bodyWeight);
      }
    }

    const totalWeightPerWorkout: IStatPoint[] = Array.from(weightPerDayMap.entries()).map(
      ([date, value]) => ({ date, value })
    );

    const progress: IStatPoint[] = Array.from(bodyWeightMap.entries()).map(
      ([date, value]) => ({ date, value })
    );

    const latestBodyWeight = workouts.length > 0 ? workouts[workouts.length - 1]!.bodyWeight || 0 : 0;
    const workoutsInMonth = workouts.length;
    const totalWorkouts = await this.workoutRepo.count({ where: { userId } });

    return {
      weight: latestBodyWeight,
      workoutsInMonth,
      totalWeightInMonth,
      totalWeightPerWorkout,
      progress,
      totalWorkouts
    };
  }

  public async getExerciseStats(userId: number): Promise<IExerciseStats[]> {
    const workouts = await this.workoutRepo.find({
      where: { userId },
      order: { completedAt: "ASC" },
    });

    if (workouts.length === 0) return [];

    // Предзагрузка всех упражнений, чтобы исключить await внутри циклов
    const allExercises = await this.exRepo.find();
    const exerciseCache = new Map<number, Exercise>(allExercises.map(e => [e.id, e]));

    const statsMap = new Map<number, IExerciseStats>();

    for (const workout of workouts) {
      // Для упражнений сохраняем дату СО ВРЕМЕНЕМ ("01.08 15:37")
      const dateTimeStr = this.formatDate(workout.completedAt, true);
      if (!dateTimeStr) continue;

      for (const ex of workout.exercisesSnapshot) {
        if (!ex.exerciseId) continue;

        const exWeight = Number(ex.weight) || 0;
        const dbEx = exerciseCache.get(ex.exerciseId);

        if (!statsMap.has(ex.exerciseId)) {
          statsMap.set(ex.exerciseId, {
            exercise: {
              id: ex.exerciseId,
              name: ex.name,
              muscleGroup: dbEx?.muscleGroup,
              description: dbEx?.description
            } as IExercisesList,
            maxWeight: exWeight,
            currentWeight: exWeight,
            lastUse: dateTimeStr,
            progress: [{ date: dateTimeStr, value: exWeight }],
          });
        } else {
          const stat = statsMap.get(ex.exerciseId)!;
          
          if (exWeight > stat.maxWeight) {
            stat.maxWeight = exWeight;
          }
          
          stat.currentWeight = exWeight;
          stat.lastUse = dateTimeStr;
          
          // Добавляем точку (теперь у каждой точки уникальное время "01.08 15:37", "01.08 16:10")
          stat.progress.push({ date: dateTimeStr, value: exWeight });
        }
      }
    }

    return Array.from(statsMap.values());
  }
}