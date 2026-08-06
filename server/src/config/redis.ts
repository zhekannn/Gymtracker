import { Redis } from 'ioredis';
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  connectTimeout: 500,   
  commandTimeout: 200
});
redis.on('error', (err) => {
  console.warn('[Redis Driver Error]:', err.message);
});