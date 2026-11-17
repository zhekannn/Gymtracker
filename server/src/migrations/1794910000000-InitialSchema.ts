import type { MigrationInterface, QueryRunner } from "typeorm";

// IF NOT EXISTS also baselines installations previously created by synchronize:true.
export class InitialSchema1794910000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL PRIMARY KEY,
      "username" varchar(255) NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "weight" numeric(5,2),
      "height" integer NOT NULL,
      "password" varchar(255) NOT NULL,
      "birthDate" date
    )`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_username_unique" ON "users" ("username")`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "exercises" (
      "id" SERIAL PRIMARY KEY,
      "name" varchar NOT NULL UNIQUE,
      "muscleGroup" varchar NOT NULL,
      "description" text,
      "imageUrl" varchar
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "trainingPlans" (
      "id" SERIAL PRIMARY KEY,
      "name" varchar(255) NOT NULL,
      "exercises" json,
      "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "workouts" (
      "id" SERIAL PRIMARY KEY,
      "completedAt" timestamptz NOT NULL DEFAULT now(),
      "planNameSnapshot" varchar(255),
      "exercisesSnapshot" json NOT NULL,
      "note" varchar,
      "userId" integer NOT NULL REFERENCES "users"("id"),
      "planId" integer REFERENCES "trainingPlans"("id") ON DELETE SET NULL,
      "bodyWeight" numeric(5,2)
    )`);
  }

  public async down(): Promise<void> {
    // Some tables may have existed before this migration; never drop user data on revert.
    throw new Error("The initial schema baseline cannot be reverted automatically. Restore a database backup instead.");
  }
}
