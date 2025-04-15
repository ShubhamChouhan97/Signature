import { Redis } from 'ioredis';

const redisInstance = new Redis({
    password: process.env.REDIS_PASSWORD
})

export default redisInstance;