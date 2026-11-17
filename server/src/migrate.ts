import { AppDataSource } from "./data-source.js";

try {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations({ transaction: "all" });
  console.log("Database migrations completed");
} catch (error) {
  console.error("Database migration failed:", error instanceof Error ? error.name : "UnknownError");
  process.exitCode = 1;
} finally {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
}
