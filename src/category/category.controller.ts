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
import { CategoryService } from "./category.service";
import { CreateCategoryDTO } from "src/dto/create-category.dto";
import { UpdateCategoryDTO } from "src/dto/update-category.dto";

@Controller("api/categories")
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post(":userId")
  @HttpCode(201)
  async create(
    @Body() data: CreateCategoryDTO,
    @Param("userId", ParseIntPipe) userId: number,
  ) {
    const result = await this.categoryService.createCategory(data, userId);

    return result;
  }

  @Get(":userId")
  @HttpCode(200)
  async getAll(@Param("userId", ParseIntPipe) userId: number) {
    const result = await this.categoryService.getAllCategories(userId);

    return {
      categories: result,
    };
  }

  @Patch(":userId/:categoryId")
  @HttpCode(200)
  async update(
    @Body() data: UpdateCategoryDTO,
    @Param("userId", ParseIntPipe) userId: number,
    @Param("categoryId", ParseIntPipe) categoryId: number,
  ) {
    const result = await this.categoryService.updateCategory(
      categoryId,
      userId,
      data,
    );

    return result;
  }

  @Delete(":userId/:categoryId")
  @HttpCode(200)
  async delete(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("categoryId", ParseIntPipe) categoryId: number,
  ) {
    const result = await this.categoryService.deleteCategory(
      userId,
      categoryId,
    );

    return result;
  }
}
