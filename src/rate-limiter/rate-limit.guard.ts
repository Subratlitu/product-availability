import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimiter: RateLimiterService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const apiKey = req.apiKey ?? req.headers['x-api-key'];

    const allowed = await this.rateLimiter.isAllowed(apiKey);

    if (!allowed) {
      const remaining = await this.rateLimiter.getRemaining(apiKey);

      throw new HttpException(
        `Rate limit exceeded. Try again later. Remaining this minute: ${remaining}`,
        HttpStatus.TOO_MANY_REQUESTS, // 429
      );
    }

    return true;
  }
}
