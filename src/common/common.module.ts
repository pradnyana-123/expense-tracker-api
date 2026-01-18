import { Global, Module, OnModuleDestroy, Inject } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import Redis from "ioredis";
import { RateLimitService } from "./rate-limit.service";
import { REDIS_CLIENT } from "./constants";
import { JwtModule } from "@nestjs/jwt";
@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: "supersecret123",
      signOptions: {
        expiresIn: "7D",
      },
    }),
  ],
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

        return redis;
      },
    },
    RateLimitService,
  ],
  exports: [PrismaService, RateLimitService, JwtModule, REDIS_CLIENT],
})
export class CommonModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.disconnect();
  }
}
