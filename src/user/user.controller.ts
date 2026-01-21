import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { RegisterUserDTO } from "src/dto/register-user.dto";
import { UserService } from "./user.service";
import { RateLimitGuard } from "src/guards/rate-limit.guard";
import { RateLimit } from "src/common/rate-limit.decorator";
import { LoginUserDTO } from "src/dto/login-user.dto";
import { Response } from "express";
import { Public } from "src/common/public.decorator";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("api/users")
@UseGuards(RateLimitGuard, AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Public()
  @HttpCode(201)
  async register(@Body() data: RegisterUserDTO) {
    const result = await this.userService.registerUser(data);

    return result;
  }

  @Post("/login")
  @Public()
  @HttpCode(200)
  async login(@Body() data: LoginUserDTO, @Res() res: Response) {
    const result = await this.userService.loginUser(data);

    res.cookie("access_token", result, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successfull" });
  }

  @Get()
  @RateLimit(10, 60)
  async getAll() {
    const result = await this.userService.getUsers();

    return result;
  }
}
