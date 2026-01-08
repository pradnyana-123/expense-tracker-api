import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDTO } from 'src/dto/create-expense.dto';

@Controller('api/expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post(':userId')
  @HttpCode(201)
  async create(
    @Body() data: CreateExpenseDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const result = await this.expenseService.createExpense(data, userId);

    return result;
  }

  @Get(':userId')
  @HttpCode(200)
  async getAll(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.expenseService.getAllExpenses(userId);

    return result;
  }
}
