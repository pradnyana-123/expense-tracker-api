import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/common/prisma.service";
import { CreateExpenseDTO } from "src/dto/create-expense.dto";
import { Prisma } from "../../generated/prisma/browser";
import { UpdateExpenseDTO } from "src/dto/update-expense.dto";
@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async createExpense(data: CreateExpenseDTO, userId: number) {
    const userExistOrNot = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExistOrNot) {
      throw new NotFoundException("User not found");
    }

    const normalizedAmount = new Prisma.Decimal(
      data.amount.replace(/\./g, "").replace(",", "."),
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
      throw new NotFoundException("User not found");
    }

    return this.prisma.expense.findMany({
      where: { userId },
    });
  }

  async updateExpense(
    userId: number,
    expenseId: number,
    data: UpdateExpenseDTO,
  ) {
    const expenseExistOrNot = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expenseExistOrNot) {
      throw new NotFoundException("Expense not found");
    }

    if (expenseExistOrNot.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update this expense",
      );
    }

    const expense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...data,
        ...(data.amount !== undefined && {
          amount: new Prisma.Decimal(
            data.amount.replace(/\./g, "").replace(",", "."),
          ),
        }),
      },
      select: {
        id: true,
        description: true,
        amount: true,
      },
    });

    return expense;
  }

  async deleteExpense(userId: number, expenseId: number) {
    const expenseExistOrNot = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expenseExistOrNot) {
      throw new NotFoundException("Expense not found");
    }

    if (expenseExistOrNot.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to update this expense",
      );
    }

    await this.prisma.expense.delete({
      where: { id: expenseId, userId },
      select: {
        id: true,
        description: true,
        amount: true,
      },
    });

    return {
      message: "Expense deleted successfully",
    };
  }

  async assignExpense(userId: number, expenseId: number, categoryId: number) {
    const expenseExistOrNot = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expenseExistOrNot) {
      throw new NotFoundException("Expense not found");
    }

    if (expenseExistOrNot.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to assign this expense",
      );
    }

    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException("Category not found");
    }

    if (existingCategory.userId !== userId) {
      throw new ForbiddenException(
        "You are not allowed to modify this category",
      );
    }

    await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        categoryId,
        userId,
      },
      select: {
        id: true,
        description: true,
        amount: true,
      },
    });

    return {
      message: "Expense assigned successfully",
    };
  }
}
