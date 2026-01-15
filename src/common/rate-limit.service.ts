import { Inject, Injectable } from "@nestjs/common";
import { REDIS_CLIENT } from "./common.module";
import Redis from "ioredis";

@Injectable()
export class RateLimitService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async isAllowed(key: string, ttl: number, limit: number) {
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, ttl);
    }

    const remaining = Math.max(0, limit - current);

    return {
      allowed: current <= limit,
      remaining,
    };
  }
}
