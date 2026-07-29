import { MoreThanOrEqual } from "typeorm";
import { IUserStats, IExerciseStats, IStatPoint, IExercisesList } from "../../../shared/types";
import { AppDataSource } from "../data-source";
import { Workout } from "../entities/Workout";
import { Exercise } from "../entities/Exercise";
export class StatService {
  private workoutRepo = AppDataSource.getRepository(Workout);
  private exRepo=AppDataSource.getRepository(Exercise);
  public async getUserStats(userId: number): Promise<IUserStats> {
    // 1. Вычисляем дату "30 дней назад"
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    // 2. Достаем тренировки пользователя за последний месяц
    const workouts = await this.workoutRepo.find({
      where: {
        userId: userId,
        completedAt: MoreThanOrEqual(oneMonthAgo),
      },
      order: {
        completedAt: "ASC", // Сортируем от старых к новым для правильного графика
      },
    });
    // 3. Считаем общий тоннаж за месяц и формируем точки для графиков
    let totalWeightInMonth = 0;

    // Группируем объем (тоннаж) по дням для totalWeightPerWorkout
    const weightPerDayMap = new Map<string, number>();
    
    // Группируем вес тела по дням для progress (динамика веса тела)
    const bodyWeightMap = new Map<string, number>();

    for (const workout of workouts) {
      // Форматируем дату в YYYY-MM-DD
      const dateStr = new Date(workout.completedAt).toISOString().split("T")[0];

      // Вычисляем суммарный объем тренировки: сумма (sets * reps * weight) по всем упражнениям
      const workoutVolume = workout.exercisesSnapshot.reduce((acc, ex) => {
        const sets = Number(ex.sets) || 0;
        const reps = Number(ex.reps) || 0;
        const weight = Number(ex.weight) || 0;
        return acc + sets * reps * weight;
      }, 0);
      totalWeightInMonth += workoutVolume;

      // Накапливаем тоннаж за день
      const currentDayVolume = weightPerDayMap.get(dateStr!) || 0;
      weightPerDayMap.set(dateStr!, currentDayVolume + workoutVolume);

      // Записываем вес тела (если он был указан в тренировке)
      if (workout.bodyWeight && workout.bodyWeight > 0) {
        bodyWeightMap.set(dateStr!, workout.bodyWeight);
      }
    }

    // 4. Преобразуем Map в массивы IStatPoint[]
    const totalWeightPerWorkout: IStatPoint[] = Array.from(weightPerDayMap.entries()).map(
      ([date, value]) => ({ date, value })
    );

    const progress: IStatPoint[] = Array.from(bodyWeightMap.entries()).map(
      ([date, value]) => ({ date, value })
    );

    // Берем самый последний известный вес тела или 0
    const latestBodyWeight = workouts.length > 0 ? workouts[workouts.length - 1]!.bodyWeight || 0 : 0;
    const workoutsInMonth=workouts.length;
    const totalWorkouts=await this.workoutRepo.count({where:{userId:userId}});
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
    // Достаем все тренировки пользователя
    const workouts = await this.workoutRepo.find({
      where: { userId },
      order: { completedAt: "ASC" },
    });
    if(workouts.length==0) return [];
    // Мапа для агрегации статистики по каждому уникальному exerciseId
    const statsMap = new Map<number, IExerciseStats>();

    for (const workout of workouts) {
      const dateStr = new Date(workout.completedAt).toISOString();
    if(!dateStr) continue;
      for (const ex of workout.exercisesSnapshot) {
        if (!ex.exerciseId) continue;

        const exWeight = Number(ex.weight) || 0;

        if (!statsMap.has(ex.exerciseId)) {
          const exercise=await this.exRepo.findOneBy({id:ex.exerciseId});
          statsMap.set(ex.exerciseId, {
            exercise: {
              id: ex.exerciseId,
              name: ex.name,
              muscleGroup:exercise?.muscleGroup,
              description:exercise?.description
              // По необходимости добавьте остальные поля IExercisesList
            } as IExercisesList,
            maxWeight: exWeight,
            currentWeight: exWeight,
            lastUse: dateStr,
            progress: [{ date: dateStr, value: exWeight }],
          });
        } else {
          const stat = statsMap.get(ex.exerciseId)!;
          
          if (exWeight > stat.maxWeight) {
            stat.maxWeight = exWeight;
          }
          
          stat.currentWeight = exWeight;
          stat.lastUse = dateStr;
          stat.progress.push({ date: dateStr, value: exWeight });
        }
      }
    }

    return Array.from(statsMap.values());
  }
}