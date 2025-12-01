import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { ApiKeyGuard } from './api-key.guard';
import { RateLimitGuard } from './rate-limit.guard';
import { CombinedRateLimitGuard } from './combined.guard';
import { RedisModule } from '../cache/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    RateLimiterService,
    ApiKeyGuard,
    RateLimitGuard,
    CombinedRateLimitGuard,
  ],
  exports: [CombinedRateLimitGuard]
})
export class RateLimiterModule {}
