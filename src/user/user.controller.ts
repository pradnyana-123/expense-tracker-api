import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CreateUserDTO } from 'src/dto/user-dto';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() data: CreateUserDTO) {
    const result = await this.userService.createNewUser(data);

    return result;
  }
}
