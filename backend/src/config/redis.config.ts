import IORedis, { RedisOptions } from 'ioredis';
import { ENV } from './env.config';

export const redisConnectionOptions: RedisOptions = {
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redisClient = new IORedis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log('✅ [Redis] Connected successfully');
});

redisClient.on('error', (err) => {
  console.error('⚠️ [Redis] Connection warning/error:', err.message);
});
