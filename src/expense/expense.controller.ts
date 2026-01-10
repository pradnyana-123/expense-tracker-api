import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ExpenseService } from "./expense.service";
import { CreateExpenseDTO } from "src/dto/create-expense.dto";
import { UpdateExpenseDTO } from "src/dto/update-expense.dto";

@Controller("api/expense")
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post(":userId")
  @HttpCode(201)
  async create(
    @Body() data: CreateExpenseDTO,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    const result = await this.expenseService.createExpense(data, userId);

    return result;
  }

  @Get(":userId")
  @HttpCode(200)
  async getAll(@Param("userId", ParseIntPipe) userId: number) {
    const result = await this.expenseService.getAllExpenses(userId);

    return result;
  }

  @Patch(":userId/:expenseId")
  @HttpCode(200)
  async update(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("expenseId", ParseIntPipe) expenseId: number,
    @Body() data: UpdateExpenseDTO,
  ) {
    const result = await this.expenseService.updateExpense(
      userId,
      expenseId,
      data,
    );

    return result;
  }

  @Patch(":userId/:categoryId/:expenseId")
  async assignExpense(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("categoryId", ParseIntPipe) categoryId: number,
    @Param("expenseId", ParseIntPipe) expenseId: number,
  ) {
    const result = await this.expenseService.assignExpense(
      userId,
      expenseId,
      categoryId,
    );

    return result;
  }

  @Delete(":userId/:expenseId")
  @HttpCode(200)
  async delete(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("expenseId", ParseIntPipe) expenseId: number,
  ) {
    const result = await this.expenseService.deleteExpense(userId, expenseId);

    return result;
  }
}
