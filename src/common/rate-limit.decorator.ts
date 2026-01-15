import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "rate_limit";

export interface RateLimitOptions {
  limit: number;
  ttl: number;
  key?: string;
}

export const RateLimit = (limit: number, ttl: number, key?: string) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttl, key } as RateLimitOptions);
