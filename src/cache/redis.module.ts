// src/cache/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') ?? '127.0.0.1';
        const port = Number(config.get<number>('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD') || undefined;

        try {
          const client: RedisClient = new Redis({
            host,
            port,
            password,
            // recommended options:
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
          });

          client.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log(' Redis connected');
          });

          client.on('error', (err) => {
            // eslint-disable-next-line no-console
            console.log(' Redis error:', err && err.message ? err.message : err);
          });

          return client;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(' Redis client creation failed, continuing without Redis', err);
          return null;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
