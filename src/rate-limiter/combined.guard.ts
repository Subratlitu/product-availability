import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { RateLimitGuard } from './rate-limit.guard';

@Injectable()
export class CombinedRateLimitGuard implements CanActivate {
  constructor(
    private apiKeyGuard: ApiKeyGuard,
    private rateLimitGuard: RateLimitGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.apiKeyGuard.canActivate(context);
    return await this.rateLimitGuard.canActivate(context);
  }
}
