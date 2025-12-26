import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async deleteAll() {
    await this.deleteExpense();
    await this.deleteCategory();
    await this.deleteUser();
  }

  async deleteUser() {
    await this.prisma.user.deleteMany({
      where: {
        username: 'test user',
      },
    });
  }

  async deleteCategory() {
    await this.prisma.category.deleteMany({
      where: {
        name: 'test category',
      },
    });
  }

  async deleteExpense() {
    await this.prisma.expense.deleteMany({
      where: { description: 'test description' },
    });
  }
}
