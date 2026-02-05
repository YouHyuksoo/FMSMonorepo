/**
 * @file apps/api/src/inspection/schedule.controller.ts
 * @description 점검 일정 컨트롤러
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
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InspectionScheduleStatus } from '@prisma/client';

@Controller('inspection-schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(
    @Query('masterId') masterId?: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('status') status?: InspectionScheduleStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.scheduleService.findAll({
      masterId,
      equipmentId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('overdue')
  async getOverdue() {
    return this.scheduleService.getOverdue();
  }

  @Get('upcoming')
  async getUpcoming(@Query('days') days?: string) {
    return this.scheduleService.getUpcoming(days ? parseInt(days, 10) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      masterId: string;
      equipmentId: string;
      scheduledDate: string;
      dueDate: string;
    },
  ) {
    return this.scheduleService.create({
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      dueDate: new Date(data.dueDate),
    });
  }

  @Post('bulk')
  async createBulk(
    @Body()
    data: {
      masterId: string;
      equipmentIds: string[];
      scheduledDate: string;
      dueDate: string;
    },
  ) {
    return this.scheduleService.createBulk({
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      dueDate: new Date(data.dueDate),
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      scheduledDate?: string;
      dueDate?: string;
      status?: InspectionScheduleStatus;
    },
  ) {
    return this.scheduleService.update(id, {
      ...data,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }

  @Post('check-overdue')
  async checkAndUpdateOverdue() {
    return this.scheduleService.checkAndUpdateOverdue();
  }
}
