export interface IUser {
    id: number;
    username: string;
    email: string;
    weight?: number;
    height?: number;
    trainingCount?:number;
}
export interface IExercise {
    exerciseId: number;
    name: string;
    sets: string;
    reps: string;
    weight: string;
  }
export interface IPlan {
    id?:number;
    name:string;
    exercises:IExercise[];
    userId:number;
}
export interface IWorkout{
    id:number;
    note?:string;
    planNameSnapshot?:string;
    userId?:number;
    exercisesSnapshot: IExercise[];
    completedAt: Date | string;
    planId?: number;
}
export interface IExercisesList{
    id:number;
    name:string;
    muscleGroup:string;
    description:string;
}