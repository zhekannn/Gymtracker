import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password:process.env.REDIS_PASSWORD || '',
  tls: {},
  maxLoadingRetryTime:500,
  maxRetriesPerRequest:10
});
redis.on('error', (err) => {
  console.warn('[Redis Driver Error]:', err.message);
});