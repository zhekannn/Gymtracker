import { Workout } from "../entities/Workout.js";
import { AppDataSource } from "../data-source.js";
import type { IWorkout } from "../../../shared/types.js";
import { User } from "../entities/User.js";
import { TrainingPlans } from "../entities/TrainingPlans.js";
import type { DeleteResult } from "typeorm";
import { redis } from "../config/redis.js";
import type { WorkoutInput } from "../validation/schemas.js";
import { HttpError } from "../utils/HttpError.js";

export class WorkoutService {
  private workoutRepo = AppDataSource.getRepository(Workout);

  public getWorkouts(userId: number): Promise<IWorkout[]> {
    return this.workoutRepo.find({ where: { userId } });
  }

  private async invalidateStats(userId: number): Promise<void> {
    try {
      await redis.del(`stats:user:${userId}`, `stats:exercises:${userId}`);
    } catch {
      // A cache outage must not turn an already committed write into a failed request.
      console.warn("Could not invalidate workout statistics cache");
    }
  }

  public async create(data: WorkoutInput, userId: number): Promise<Workout> {
    const workout = await AppDataSource.transaction(async manager => {
      const plan = data.planId === undefined ? null :
        await manager.getRepository(TrainingPlans).findOneBy({ id: data.planId, userId });
      if (data.planId !== undefined && !plan) throw new HttpError(404, "Plan not found");
      const repo = manager.getRepository(Workout);
      const created = repo.create({
        exercisesSnapshot: data.exercisesSnapshot, userId, completedAt: new Date(),
        planNameSnapshot: plan?.name ?? data.planNameSnapshot ?? "Quick workout",
        ...(data.note !== undefined ? { note: data.note } : {}),
        ...(data.planId !== undefined ? { planId: data.planId } : {}),
        ...(data.bodyWeight !== undefined ? { bodyWeight: data.bodyWeight } : {}),
      });
      const result = await repo.insert(created);
      created.id = result.identifiers[0]!.id;
      if (data.bodyWeight !== undefined) {
        await manager.getRepository(User).update(userId, { weight: data.bodyWeight });
      }
      return created;
    });
    await this.invalidateStats(userId);
    return workout;
  }

  public async delete(workoutId: number, userId: number): Promise<DeleteResult> {
    const result = await this.workoutRepo.delete({ userId, id: workoutId });
    if (result.affected) await this.invalidateStats(userId);
    return result;
  }

  public async getWorkoutsByUser(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [workouts, total] = await this.workoutRepo.findAndCount({
      where: { userId }, order: { completedAt: "DESC" }, take: limit, skip,
    });
    return { workouts, total, hasMore: skip + workouts.length < total };
  }
}
