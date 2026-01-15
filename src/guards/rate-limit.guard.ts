import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "src/common/rate-limit.decorator";
import { RateLimitService } from "src/common/rate-limit.service";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimiter: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!metadata) return true;

    const request = context.switchToHttp().getRequest();

    console.log("IP Address: ", request.ip);

    const key =
      metadata.key || `rate:limit:${request.ip}:${request.route?.path}`;

    const { allowed } = await this.rateLimiter.isAllowed(
      key,
      metadata.ttl,
      metadata.limit,
    );

    if (!allowed) {
      throw new HttpException("Too many request", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
