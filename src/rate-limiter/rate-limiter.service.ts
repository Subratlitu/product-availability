import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimiterService {
  private MAX_REQUESTS = 60;      // 60 requests
  private WINDOW = 60;            // per 60 seconds

  constructor(private redis: Redis) {}

  async isAllowed(apiKey: string): Promise<boolean> {
    const key = `ratelimit:${apiKey}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, this.WINDOW);
    }

    return current <= this.MAX_REQUESTS;
  }

  async getRemaining(apiKey: string) {
    const key = `ratelimit:${apiKey}`;
    const count = Number(await this.redis.get(key)) || 0;
    return Math.max(0, this.MAX_REQUESTS - count);
  }
}
