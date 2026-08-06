export interface IUser {
    id: number;
    username: string;
    email: string;
    weight?: number;
    height?: number;
    trainingCount?:number;
    birthDate?:Date;
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
    id?:number;
    note?:string;
    planNameSnapshot?:string;
    userId?:number;
    exercisesSnapshot: IExercise[];
    completedAt?: Date | string;
    planId?: number;
    bodyWeight?:number;
}
export interface IExercisesList{
    id:number;
    name:string;
    muscleGroup:string;
    description:string;
}
export interface IExerciseStats{
    exercise:IExercisesList;
    maxWeight:number;
    currentWeight:number;
    lastUse:Date | string;
    progress:IStatPoint[];
}
export interface IUserStats{
    weight:number;
    workoutsInMonth:number;
    totalWeightInMonth:number;
    totalWeightPerWorkout:IStatPoint[];
    progress:IStatPoint[];
    totalWorkouts:number;
    weightMonthAgo:number;
}
export interface IStatPoint {
  date: string;
  value: number; 
}
export interface IGeneratePlanInfo{
    goal:string;
    daysCount:number;
    experience:string;
    additionalNotes:string;
    age?: number;
    weight?: number; 
    height?: number; 
}