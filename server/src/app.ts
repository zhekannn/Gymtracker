import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { ZodError } from "zod";
import { QueryFailedError } from "typeorm";
import userRoutes from "./routes/userRoutes.js";
import { apiLimiter } from "./middleware/rateLimits.js";
import { HttpError } from "./utils/HttpError.js";

const app = express();
app.disable("x-powered-by");
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(proxyHops) || proxyHops < 0 || proxyHops > 3) {
  throw new Error("TRUST_PROXY_HOPS must be an integer between 0 and 3");
}
app.set("trust proxy", proxyHops);
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://localhost:3000"]),
].filter(Boolean) as string[];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new HttpError(403, "Origin is not allowed"));
  },
}));
// A lightweight probe distinguishes the current authenticated API from old deployments.
app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store").json({
    status: "ok",
    apiVersion: 2,
    revision: process.env.RENDER_GIT_COMMIT || "local",
  });
});
app.use("/api", apiLimiter);
// Reject compressed bodies as well as limiting their size, before they reach a decoder.
app.use(express.json({ limit: "64kb", inflate: false }));
app.use("/api", userRoutes);
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0]?.message || "Invalid request data" });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err instanceof QueryFailedError && (err.driverError as { code?: string }).code === "23505") {
    return res.status(409).json({ message: "A record with those values already exists" });
  }
  const status = (err as { status?: number } | null)?.status;
  if (status === 400 || status === 413 || status === 415) {
    return res.status(status).json({ message: status === 413 ? "Request body is too large" : "Invalid or unsupported request body" });
  }
  console.error("Unhandled request error:", err instanceof Error ? err.name : "UnknownError");
  return res.status(500).json({ message: "Internal server error" });
});
export default app;
