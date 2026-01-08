import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateExpenseDTO } from 'src/dto/create-expense.dto';
import { Prisma } from '../../generated/prisma/browser';
@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async createExpense(data: CreateExpenseDTO, userId: number) {
    const userExistOrNot = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExistOrNot) {
      throw new NotFoundException('User not found');
    }

    const normalizedAmount = new Prisma.Decimal(
      data.amount.replace(/\./g, '').replace(',', '.'),
    );

    const expense = await this.prisma.expense.create({
      data: {
        ...data,
        userId,
        amount: normalizedAmount,
      },
      select: {
        id: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    });

    return expense;
  }

  async getAllExpenses(userId: number) {
    const userExistOrNot = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExistOrNot) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.expense.findMany({
      where: { userId },
    });
  }
}
