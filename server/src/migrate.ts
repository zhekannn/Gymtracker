import { AppDataSource } from "./data-source.js";

try {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations({ transaction: "all" });
  console.log("Database migrations completed");
} catch (error) {
  const failure = error as { code?: unknown; driverError?: { code?: unknown } } | null;
  const rawCode = failure?.code ?? failure?.driverError?.code;
  const code = typeof rawCode === "string" && /^[A-Z0-9_]{2,64}$/.test(rawCode) ? rawCode : "UNKNOWN";
  // Log the diagnostic code without SQL parameters, credentials or user data.
  console.error("Database migration failed:", error instanceof Error ? error.name : "UnknownError", code);
  process.exitCode = 1;
} finally {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
}
