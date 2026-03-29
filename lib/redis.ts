import Redis from 'ioredis';

const REDIS_AVAILABLE = !!(process.env.REDIS_HOST || process.env.REDIS_URL);

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME || 'default',
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 2000,
};

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!REDIS_AVAILABLE) return null;
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    redisClient.on('error', () => { /* suppress */ });
  }
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string, 
  value: T, 
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // no-op
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch {
    // no-op
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // no-op
  }
}

// Rate limiting helpers
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  try {
    const client = getRedisClient();
    if (!client) return { allowed: true, remaining: maxRequests, resetTime: Date.now() / 1000 + windowSeconds };
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;
    
    // Remove old entries
    await client.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    const currentCount = await client.zcard(key);
    
    if (currentCount >= maxRequests) {
      const oldest = await client.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = parseInt(oldest[1]) + windowSeconds;
      return { allowed: false, remaining: 0, resetTime };
    }
    
    // Add current request
    await client.zadd(key, now, `${now}-${Math.random()}`);
    await client.expire(key, windowSeconds);
    
    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetTime: now + windowSeconds,
    };
  } catch (error) {
    console.error('Redis checkRateLimit error:', error);
    // Fail open in case of Redis error
    return { allowed: true, remaining: 1, resetTime: Date.now() / 1000 + windowSeconds };
  }
}

// Job queue helpers for async processing
export async function queueJob(
  queueName: string,
  jobData: Record<string, unknown>
): Promise<string> {
  const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id: jobId,
    ...jobData,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  try {
    const client = getRedisClient();
    if (client) {
      await client.lpush(`queue:${queueName}`, JSON.stringify(job));
      await setCache(jobId, job, 86400);
    }
  } catch {
    // no-op
  }
  return jobId;
}

export async function getJobStatus(jobId: string): Promise<Record<string, unknown> | null> {
  return getCache<Record<string, unknown>>(jobId);
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const job = await getJobStatus(jobId);
  if (job) {
    await setCache(jobId, {
      ...job,
      status,
      ...data,
      updatedAt: new Date().toISOString(),
    }, 86400);
  }
}

// Distributed lock for preventing race conditions
export async function acquireLock(
  lockKey: string,
  ttlSeconds: number = 30
): Promise<{ release: () => Promise<void> } | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const token = `${Date.now()}:${Math.random()}`;
    const acquired = await client.set(lockKey, token, 'EX', ttlSeconds, 'NX');
    
    if (acquired === 'OK') {
      return {
        release: async () => {
          const current = await client.get(lockKey);
          if (current === token) {
            await client.del(lockKey);
          }
        },
      };
    }
    return null;
  } catch (error) {
    console.error('Redis acquireLock error:', error);
    return null;
  }
}

// Session/Token helpers
export async function storeSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttlSeconds: number = 86400
): Promise<void> {
  await setCache(`session:${sessionId}`, data, ttlSeconds);
}

export async function getSession<T>(sessionId: string): Promise<T | null> {
  return getCache<T>(`session:${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteCache(`session:${sessionId}`);
}

// Cache warming helpers
export async function warmCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached) return cached;
  
  const data = await fetcher();
  await setCache(key, data, ttlSeconds);
  return data;
}

// Analytics/Metrics helpers
export async function incrementCounter(
  key: string,
  amount: number = 1,
  ttlSeconds: number = 86400
): Promise<number> {
  try {
    const client = getRedisClient();
    if (!client) return 0;
    const newValue = await client.incrby(key, amount);
    await client.expire(key, ttlSeconds);
    return newValue;
  } catch (error) {
    console.error('Redis incrementCounter error:', error);
    return 0;
  }
}

export async function getCounter(key: string): Promise<number> {
  try {
    const client = getRedisClient();
    if (!client) return 0;
    const value = await client.get(key);
    return parseInt(value || '0', 10);
  } catch (error) {
    console.error('Redis getCounter error:', error);
    return 0;
  }
}
