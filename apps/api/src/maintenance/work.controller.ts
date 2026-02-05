/**
 * @file apps/api/src/maintenance/work.controller.ts
 * @description 유지보수 작업 컨트롤러
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkService } from './work.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkStatus } from '@prisma/client';

@Controller('maintenance-works')
@UseGuards(JwtAuthGuard)
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Get()
  async findAll(
    @Query('planId') planId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('status') status?: WorkStatus,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.workService.findAll({
      planId,
      assignedToId,
      status,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('my')
  async findMyWorks(@Request() req: any, @Query('status') status?: WorkStatus) {
    return this.workService.findMyWorks(req.user.id, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      planId: string;
      assignedToId: string;
      description?: string;
    },
  ) {
    return this.workService.create(data);
  }

  @Patch(':id/start')
  async start(@Param('id') id: string) {
    return this.workService.start(id);
  }

  @Patch(':id/pause')
  async pause(@Param('id') id: string) {
    return this.workService.pause(id);
  }

  @Patch(':id/resume')
  async resume(@Param('id') id: string) {
    return this.workService.resume(id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body()
    data: {
      workReport: string;
      actualHours?: number;
      usedMaterials?: { materialId: string; quantity: number }[];
    },
  ) {
    return this.workService.complete(id, data);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.workService.cancel(id);
  }

  @Patch(':id/reassign')
  async reassign(
    @Param('id') id: string,
    @Body() data: { assignedToId: string },
  ) {
    return this.workService.reassign(id, data.assignedToId);
  }
}
