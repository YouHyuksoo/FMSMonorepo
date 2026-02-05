/**
 * @file apps/api/src/material/warehouse.controller.ts
 * @description 창고 컨트롤러
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
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  async findAll() {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  @Get(':id/summary')
  async getInventorySummary(@Param('id') id: string) {
    return this.warehouseService.getInventorySummary(id);
  }

  @Post()
  async create(
    @Body() data: { code: string; name: string; description?: string },
  ) {
    return this.warehouseService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { code?: string; name?: string; description?: string },
  ) {
    return this.warehouseService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.warehouseService.delete(id);
  }
}
