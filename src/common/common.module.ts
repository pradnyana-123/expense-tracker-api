import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

export const REDIS_CLIENT = "REDIS_CLIENT";
import Redis from "ioredis";
import { RateLimitService } from "./rate-limit.service";
@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redis = new Redis({
          port: 6379,
          host: "localhost",
        });

        redis.on("connect", () => {
          console.log("Successfully connected to Redis");
        });

        redis.on("error", (err) => {
          console.log("There's an error while connecting to redis: ", err);
        });

        (redis as any).onModuleDestroy = async () => {
          await redis.disconnect();
        };

        return redis;
      },
    },
    RateLimitService,
  ],
  exports: [PrismaService, RateLimitService, REDIS_CLIENT],
})
export class CommonModule {}
