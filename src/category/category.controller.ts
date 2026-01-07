import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from 'src/dto/create-category.dto';

@Controller('api/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post(':userId')
  @HttpCode(201)
  async create(
    @Body() data: CreateCategoryDTO,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const result = await this.categoryService.createCategory(data, userId);

    return result;
  }

  @Get(':userId')
  @HttpCode(200)
  async getAll(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.categoryService.getAllCategories(userId);

    return {
      categories: result,
    };
  }
}
