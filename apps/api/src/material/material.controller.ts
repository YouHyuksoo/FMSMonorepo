/**
 * @file apps/api/src/material/material.controller.ts
 * @description 자재 컨트롤러 - API 엔드포인트
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaterialService } from './material.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.materialService.findAll({
      search,
      categoryId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('low-stock')
  async getLowStockItems() {
    return this.materialService.getLowStockItems();
  }

  @Get('categories')
  async getCategories() {
    return this.materialService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.materialService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
      description?: string;
      categoryId?: string;
      unit: string;
      unitPrice?: number;
      minStock?: number;
      maxStock?: number;
      reorderPoint?: number;
    },
  ) {
    return this.materialService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      code?: string;
      name?: string;
      description?: string;
      categoryId?: string;
      unit?: string;
      unitPrice?: number;
      minStock?: number;
      maxStock?: number;
      reorderPoint?: number;
      isActive?: boolean;
    },
  ) {
    return this.materialService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.materialService.delete(id);
  }

  @Post('categories')
  async createCategory(
    @Body() data: { code: string; name: string; parentId?: string },
  ) {
    return this.materialService.createCategory(data);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: { code?: string; name?: string; parentId?: string },
  ) {
    return this.materialService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.materialService.deleteCategory(id);
  }
}
