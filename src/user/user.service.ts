import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateUserDTO } from 'src/dto/user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createNewUser(dto: CreateUserDTO) {
    const userExistOrNot = await this.prisma.user.findFirst({
      where: {
        username: dto.username,
      },
    });

    if (userExistOrNot) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    return newUser;
  }
}
