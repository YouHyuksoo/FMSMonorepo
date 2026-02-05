/**
 * @file apps/api/src/inspection/master.controller.ts
 * @description 점검 마스터 컨트롤러
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
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InspectionType, InspectionFrequency, InspectionInputType } from '@prisma/client';

@Controller('inspection-masters')
@UseGuards(JwtAuthGuard)
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('type') type?: InspectionType,
    @Query('isActive') isActive?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.masterService.findAll({
      search,
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.masterService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
      description?: string;
      type: InspectionType;
      frequency: InspectionFrequency;
      items?: {
        sequence: number;
        name: string;
        description?: string;
        method?: string;
        standard?: string;
        inputType: InspectionInputType;
        unit?: string;
        minValue?: number;
        maxValue?: number;
        options?: any;
        isRequired?: boolean;
      }[];
    },
  ) {
    return this.masterService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      type?: InspectionType;
      frequency?: InspectionFrequency;
      isActive?: boolean;
      items?: {
        sequence: number;
        name: string;
        description?: string;
        method?: string;
        standard?: string;
        inputType: InspectionInputType;
        unit?: string;
        minValue?: number;
        maxValue?: number;
        options?: any;
        isRequired?: boolean;
      }[];
    },
  ) {
    return this.masterService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.masterService.delete(id);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body()
    item: {
      sequence: number;
      name: string;
      description?: string;
      method?: string;
      standard?: string;
      inputType: InspectionInputType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      options?: any;
      isRequired?: boolean;
    },
  ) {
    return this.masterService.addItem(id, item);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body()
    data: {
      sequence?: number;
      name?: string;
      description?: string;
      method?: string;
      standard?: string;
      inputType?: InspectionInputType;
      unit?: string;
      minValue?: number;
      maxValue?: number;
      options?: any;
      isRequired?: boolean;
    },
  ) {
    return this.masterService.updateItem(itemId, data);
  }

  @Delete('items/:itemId')
  async deleteItem(@Param('itemId') itemId: string) {
    return this.masterService.deleteItem(itemId);
  }
}
