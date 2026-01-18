import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { RegisterUserDTO } from "src/dto/register-user.dto";
import * as bcrypt from "bcrypt";
import { LoginUserDTO } from "src/dto/login-user.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDTO) {
    const userExistOrNot = await this.prisma.user.findFirst({
      where: {
        username: dto.username,
      },
    });

    if (userExistOrNot) {
      throw new BadRequestException("User already exists");
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

  async loginUser(dto: LoginUserDTO) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Username or password wrong");
    }

    const token = this.jwt.sign({ id: user.id, username: user.username });

    return token;
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
  }
}
