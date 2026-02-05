/**
 * @file apps/api/src/equipment/category.controller.ts
 * @description 설비 카테고리 컨트롤러
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipment-categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  async findTree() {
    return this.categoryService.findTree();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  async create(@Body() data: { code: string; name: string; parentId?: string }) {
    return this.categoryService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { code?: string; name?: string; parentId?: string },
  ) {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
