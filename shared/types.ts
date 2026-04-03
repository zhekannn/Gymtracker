export interface IUser {
    id: number;
    username: string;
    email: string;
    weight?: number;
    height?: number;
}
export interface IExercise {
    exerciseId: number;
    name: string;
    sets: number;
    reps: number;
    weight: number;
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
    planName?:string;
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