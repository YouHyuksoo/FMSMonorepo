/**
 * @file apps/api/src/equipment/dto/equipment-filter.dto.ts
 * @description 설비 필터 DTO
 */

import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentStatus, Criticality } from '@prisma/client';

export class EquipmentFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsEnum(Criticality)
  @IsOptional()
  criticality?: Criticality;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  take?: number;
}
