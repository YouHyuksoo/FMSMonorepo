/**
 * @file apps/api/src/equipment/equipment.controller.ts
 * @description 설비 컨트롤러 - API 엔드포인트
 *
 * 엔드포인트:
 * - GET /equipments - 설비 목록 (필터, 페이징)
 * - GET /equipments/statistics - 설비 통계
 * - GET /equipments/:id - 설비 상세
 * - POST /equipments - 설비 생성
 * - PATCH /equipments/:id - 설비 수정
 * - DELETE /equipments/:id - 설비 삭제
 * - GET /equipments/:id/documents - 설비 문서 목록
 * - POST /equipments/:id/documents - 설비 문서 추가
 * - DELETE /equipments/:id/documents/:docId - 설비 문서 삭제
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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentFilterDto } from './dto/equipment-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipments')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(@Query() filter: EquipmentFilterDto) {
    return this.equipmentService.findAll(filter);
  }

  @Get('statistics')
  async getStatistics(@Query('organizationId') organizationId?: string) {
    return this.equipmentService.getStatistics(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.equipmentService.findById(id);
  }

  @Post()
  async create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.equipmentService.delete(id);
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    return this.equipmentService.getDocuments(id);
  }

  @Post(':id/documents')
  async addDocument(
    @Param('id') id: string,
    @Body() document: { type: string; name: string; filePath: string; fileSize?: number; mimeType?: string },
  ) {
    return this.equipmentService.addDocument(id, document);
  }

  @Delete(':id/documents/:docId')
  async removeDocument(@Param('docId') docId: string) {
    return this.equipmentService.removeDocument(docId);
  }
}
