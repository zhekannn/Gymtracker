import dotenv from 'dotenv';
dotenv.config({ path: [".env", "../.env"], quiet: true });

const secret = process.env.JWT_SECRET;
if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  throw new Error("JWT_SECRET must be set to a random secret of at least 32 bytes");
}
export const JWT_SECRET = secret;
export const PORT = Number(process.env.PORT || 5000);
export const DB_PASSWORD=process.env.DB_PASSWORD;
export const GEMINI_API_KEY=process.env.GEMINI_API_KEY;
export const CLIENT_URL=process.env.CLIENT_URL;
