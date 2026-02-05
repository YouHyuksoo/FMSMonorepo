/**
 * @file apps/api/src/maintenance/plan.controller.ts
 * @description 유지보수 계획 컨트롤러
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
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceType, PlanStatus } from '@prisma/client';

@Controller('maintenance-plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('requestId') requestId?: string,
    @Query('status') status?: PlanStatus,
    @Query('type') type?: MaintenanceType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.planService.findAll({
      search,
      equipmentId,
      requestId,
      status,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('upcoming')
  async getUpcoming(@Query('days') days?: string) {
    return this.planService.getUpcoming(days ? parseInt(days, 10) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.planService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      requestId?: string;
      equipmentId: string;
      type: MaintenanceType;
      title: string;
      description?: string;
      plannedStartDate: string;
      plannedEndDate: string;
      estimatedHours?: number;
      estimatedCost?: number;
      materials?: { materialId: string; quantity: number }[];
    },
  ) {
    return this.planService.create({
      ...data,
      plannedStartDate: new Date(data.plannedStartDate),
      plannedEndDate: new Date(data.plannedEndDate),
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      type?: MaintenanceType;
      title?: string;
      description?: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
      estimatedHours?: number;
      estimatedCost?: number;
      materials?: { materialId: string; quantity: number }[];
    },
  ) {
    return this.planService.update(id, {
      ...data,
      plannedStartDate: data.plannedStartDate
        ? new Date(data.plannedStartDate)
        : undefined,
      plannedEndDate: data.plannedEndDate
        ? new Date(data.plannedEndDate)
        : undefined,
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: PlanStatus },
  ) {
    return this.planService.updateStatus(id, data.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.planService.delete(id);
  }
}
