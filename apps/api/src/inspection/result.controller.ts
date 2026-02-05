/**
 * @file apps/api/src/inspection/result.controller.ts
 * @description 점검 결과 컨트롤러
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
import { ResultService } from './result.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InspectionResultStatus } from '@prisma/client';

@Controller('inspection-results')
@UseGuards(JwtAuthGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  async findAll(
    @Query('scheduleId') scheduleId?: string,
    @Query('inspectorId') inspectorId?: string,
    @Query('status') status?: InspectionResultStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.resultService.findAll({
      scheduleId,
      inspectorId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('statistics')
  async getStatistics(
    @Query('equipmentId') equipmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.resultService.getStatistics({
      equipmentId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.resultService.findById(id);
  }

  @Post('start/:scheduleId')
  async start(@Param('scheduleId') scheduleId: string, @Request() req: any) {
    return this.resultService.start(scheduleId, req.user.id);
  }

  @Patch(':id/items')
  async saveItemResults(
    @Param('id') id: string,
    @Body()
    data: {
      itemResults: {
        itemId: string;
        value?: string;
        numericValue?: number;
        status: InspectionResultStatus;
        remarks?: string;
        photoPath?: string;
      }[];
    },
  ) {
    return this.resultService.saveItemResults(id, data.itemResults);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body()
    data: {
      remarks?: string;
      itemResults: {
        itemId: string;
        value?: string;
        numericValue?: number;
        status: InspectionResultStatus;
        remarks?: string;
        photoPath?: string;
      }[];
    },
  ) {
    return this.resultService.complete(id, data);
  }
}
