import { z } from "zod";

const numberInput = z.union([
  z.number(),
  z.string().trim().regex(/^\d+(?:\.\d+)?$/).transform(Number),
]).pipe(z.number().finite());

export const idSchema = numberInput.pipe(z.number().int().positive().max(2147483647));
export const passwordSchema = z.string().min(12, "Password must be at least 12 characters long")
  .refine(value => Buffer.byteLength(value, "utf8") <= 72, "Password must not exceed 72 UTF-8 bytes");
export const emailSchema = z.email().max(254).transform(value => value.toLowerCase());
const usernameSchema = z.string().trim().min(3).max(64);
const bodyWeightSchema = numberInput.pipe(z.number().positive().max(500));
const heightSchema = numberInput.pipe(z.number().int().min(30).max(300));

export const registrationSchema = z.strictObject({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(false),
  weight: bodyWeightSchema.optional(),
  height: heightSchema,
  birthDate: z.iso.date().refine(value => value <= new Date().toISOString().slice(0, 10),
    "Birth date cannot be in the future").optional(),
});

// Existing accounts may have older passwords; enforce the new policy on creation/reset only.
export const loginSchema = z.strictObject({
  username: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(1024),
  remember: z.boolean().default(false),
});
export const forgotPasswordSchema = z.strictObject({ email: emailSchema });
export const resetPasswordSchema = z.strictObject({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  newPassword: passwordSchema,
});

export const exerciseSchema = z.strictObject({
  exerciseId: idSchema,
  name: z.string().trim().min(1).max(255),
  sets: numberInput.pipe(z.number().int().min(1).max(100)).transform(String),
  reps: numberInput.pipe(z.number().int().min(1).max(1000)).transform(String),
  weight: numberInput.pipe(z.number().min(0).max(1000)).transform(String),
});
const exercisesSchema = z.array(exerciseSchema).min(1).max(100);
export const planSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
  exercises: exercisesSchema,
});
export const workoutSchema = z.strictObject({
  exercisesSnapshot: exercisesSchema,
  note: z.string().max(2000).optional(),
  planNameSnapshot: z.string().trim().min(1).max(255).optional(),
  planId: idSchema.optional(),
  bodyWeight: bodyWeightSchema.optional(),
});
export const paginationSchema = z.strictObject({
  page: idSchema.default(1),
  limit: numberInput.pipe(z.number().int().min(1).max(100)).default(10),
}).refine(value => (value.page - 1) * value.limit <= 2147483647, "Page is too large");

export const generatePlanSchema = z.strictObject({
  goal: z.string().trim().min(1).max(200),
  daysCount: numberInput.pipe(z.number().int().min(1).max(7)),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  additionalNotes: z.string().max(2000).default(""),
  age: numberInput.pipe(z.number().int().min(1).max(120)).optional(),
  weight: bodyWeightSchema.optional(),
  height: heightSchema.optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
