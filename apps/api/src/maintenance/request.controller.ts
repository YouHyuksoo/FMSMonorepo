/**
 * @file apps/api/src/maintenance/request.controller.ts
 * @description 유지보수 요청 컨트롤러
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
  Request,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceType, Priority, RequestStatus } from '@prisma/client';

@Controller('maintenance-requests')
@UseGuards(JwtAuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('status') status?: RequestStatus,
    @Query('type') type?: MaintenanceType,
    @Query('priority') priority?: Priority,
    @Query('requesterId') requesterId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.requestService.findAll({
      search,
      equipmentId,
      status,
      type,
      priority,
      requesterId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('statistics')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.requestService.getStatistics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.requestService.findById(id);
  }

  @Post()
  async create(
    @Request() req: any,
    @Body()
    data: {
      equipmentId: string;
      type: MaintenanceType;
      priority?: Priority;
      title: string;
      description: string;
      desiredDate?: string;
    },
  ) {
    return this.requestService.create({
      ...data,
      requesterId: req.user.id,
      desiredDate: data.desiredDate ? new Date(data.desiredDate) : undefined,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      type?: MaintenanceType;
      priority?: Priority;
      title?: string;
      description?: string;
      desiredDate?: string;
    },
  ) {
    return this.requestService.update(id, {
      ...data,
      desiredDate: data.desiredDate ? new Date(data.desiredDate) : undefined,
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: RequestStatus },
  ) {
    return this.requestService.updateStatus(id, data.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.requestService.delete(id);
  }
}
