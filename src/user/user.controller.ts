import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDTO } from "src/dto/create-user-dto";
import { UserService } from "./user.service";
import { RateLimitGuard } from "src/guards/rate-limit.guard";
import { RateLimit } from "src/common/rate-limit.decorator";

@Controller("api/users")
@UseGuards(RateLimitGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateUserDTO) {
    const result = await this.userService.createNewUser(data);

    return result;
  }

  @Get()
  @RateLimit(10, 60)
  async getAll() {
    const result = await this.userService.getUsers();

    return result;
  }
}
