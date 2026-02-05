/**
 * @file apps/api/src/organization/organization.controller.ts
 * @description 조직 컨트롤러 - API 엔드포인트
 *
 * 엔드포인트:
 * - GET /organizations - 조직 목록
 * - GET /organizations/tree - 조직 트리 구조
 * - GET /organizations/:id - 조직 상세
 * - POST /organizations - 조직 생성
 * - PATCH /organizations/:id - 조직 수정
 * - DELETE /organizations/:id - 조직 삭제
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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async findAll() {
    return this.organizationService.findAll();
  }

  @Get('tree')
  async findTree() {
    return this.organizationService.findTree();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organizationService.findById(id);
  }

  @Post()
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
