import { config } from './config';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = store[key];

  if (!record || now > record.resetAt) {
    store[key] = {
      count: 1,
      resetAt: now + config.rateLimitWindowMs,
    };
    return { allowed: true, remaining: config.rateLimitMax - 1 };
  }

  if (record.count >= config.rateLimitMax) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: config.rateLimitMax - record.count };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  }
}, 60000);
