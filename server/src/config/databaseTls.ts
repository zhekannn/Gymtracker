import { SUPABASE_ROOT_CA } from "./supabaseCa.js";

export function databaseTls(env: NodeJS.ProcessEnv = process.env): { rejectUnauthorized: true; ca?: string } | false {
  const supabase = /(?:^|\.)supabase\.(?:co|com)$/i.test(env.DB_HOST || "");
  if (!supabase && env.DB_SSL !== "true") return false;
  const ca = env.DB_SSL_CA?.trim().replace(/\\n/g, "\n") || (supabase ? SUPABASE_ROOT_CA : undefined);
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}
