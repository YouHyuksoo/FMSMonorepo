/**
 * @file apps/api/src/equipment/location.controller.ts
 * @description 설비 위치 컨트롤러
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
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  async findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationService.findById(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      code: string;
      name: string;
      building?: string;
      floor?: string;
      area?: string;
    },
  ) {
    return this.locationService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      code?: string;
      name?: string;
      building?: string;
      floor?: string;
      area?: string;
    },
  ) {
    return this.locationService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.locationService.delete(id);
  }
}
