import { MoreThanOrEqual,LessThanOrEqual, Not, IsNull } from "typeorm";
import { IUserStats, IExerciseStats, IStatPoint, IExercisesList } from "../../../shared/types.js";
import { AppDataSource } from "../data-source.js";
import { Workout } from "../entities/Workout.js";
import { Exercise } from "../entities/Exercise.js";
import { redis } from "../config/redis.js";
export class StatService {
  private workoutRepo = AppDataSource.getRepository(Workout);
  private exRepo = AppDataSource.getRepository(Exercise);
  private formatDate(date: Date | string, includeTime: boolean = false): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
  
    if (!includeTime) {
      return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "numeric" });
    }
  
    const datePart = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year:"2-digit"});
    const timePart = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  
    return `${datePart} ${timePart}`;
  }
  public async getUserStatsCached(userId: number): Promise<IUserStats> {
    const cacheKey = `stats:user:${userId}`;
  
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.warn("Redis is down, fetching directly from DB...");
    }
    const stats = await this.getUserStats(userId);
  
    try {
      await redis.set(cacheKey, JSON.stringify(stats), 'EX', 900);
    } catch (err) {
    }
  
    return stats;
  }
  public async getExerciseStatsCached(userId:number):Promise<IExerciseStats[]>{
    const cacheKey = `stats:exercises:${userId}`;
  
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.warn("Redis is down, fetching directly from DB...");
    }
    const stats = await this.getExerciseStats(userId);
  
    try {
      await redis.set(cacheKey, JSON.stringify(stats), 'EX', 900);
    } catch (err) {
    }
  
    return stats;
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
      const dayKey = this.formatDate(workout.completedAt, true);

      let workoutVolume = workout.exercisesSnapshot.reduce((acc, ex) => {
        const sets = Number(ex.sets) || 0;
        const reps = Number(ex.reps) || 0;
        const weight = Number(ex.weight) || 0;
        return acc + sets * reps * weight;
      }, 0);
      workoutVolume=workoutVolume/1000;
      totalWeightInMonth += workoutVolume;

      const currentDayVolume = weightPerDayMap.get(dayKey) || 0;
      weightPerDayMap.set(dayKey, currentDayVolume + workoutVolume);

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

    const latestBodyWeight = workouts.length > 0 ? workouts[workouts.length - 1]?.bodyWeight || 0 : 0;

    const workoutsInMonth = workouts.length;
    const totalWorkouts = await this.workoutRepo.count({ where: { userId } });
    
    const oneMonthAgoDate = new Date();
    oneMonthAgoDate.setDate(oneMonthAgoDate.getDate() - 30);
    let monthAgoWorkout = await this.workoutRepo.findOne({
      where: {
        userId,
        completedAt: LessThanOrEqual(oneMonthAgoDate),
        bodyWeight: Not(IsNull()),
      },
      order: { completedAt: 'DESC' },
    });
    if (!monthAgoWorkout) {
      monthAgoWorkout = await this.workoutRepo.findOne({
        where: {
          userId,
          bodyWeight: Not(IsNull()),
        },
        order: { completedAt: 'ASC' },
      });
    }
    const weightMonthAgo = monthAgoWorkout?.bodyWeight || latestBodyWeight;
    
    return {
      weight: Number(latestBodyWeight),
      workoutsInMonth,
      totalWeightInMonth,
      totalWeightPerWorkout,
      progress,
      totalWorkouts,
      weightMonthAgo: Number(weightMonthAgo)
    };
  }

  public async getExerciseStats(userId: number, dateSpan?:Date): Promise<IExerciseStats[]> {
    const workouts = await this.workoutRepo.find({
      where: { userId },
      order: { completedAt: "ASC" },
    });

    if (workouts.length === 0) return [];

    // Предзагрузка всех упражнений, чтобы исключить await внутри циклов
    const allExercises = await this.exRepo.find({take:20});
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