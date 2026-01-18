import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.get<string>(
      "public_access",
      context.getHandler(),
    );
    if (metadata) return true;

    const request = context.switchToHttp().getRequest();

    const cookie = request.cookies["access_token"];

    if (!cookie) throw new UnauthorizedException("There's no cookies");

    if (cookie) {
      try {
        this.jwt.verify(cookie);
        return true;
      } catch (err) {
        console.error("JWT Verification error: ", err);
        return false;
      }
    }

    return false;
  }
}
