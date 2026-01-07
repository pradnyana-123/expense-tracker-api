import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: CreateCategoryDTO, userId: number) {
    const categoryExist = await this.prisma.category.findFirst({
      where: {
        name: data.name,
      },
    });

    if (categoryExist) {
      throw new BadRequestException('Category already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        userId,
        ...data,
      },
    });

    return category;
  }

  async getAllCategories(userId: number) {
    return this.prisma.category.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
