import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async deleteAll() {
    await this.prisma.expense.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async deleteExpense() {
    await this.prisma.expense.deleteMany({
      where: { description: "test description" },
    });
  }

  async createUser(userData: { username: string; password: string }) {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  async createCategory(categoryData: { name: string; userId: number }) {
    // Create unique category name to avoid conflicts
    const uniqueName = `${categoryData.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return this.prisma.category.create({
      data: {
        ...categoryData,
        name: uniqueName,
      },
    });
  }
}
