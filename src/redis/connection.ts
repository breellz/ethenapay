import IORedis from 'ioredis';


const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

export const redis = new IORedis(REDIS_CONNECTION);

