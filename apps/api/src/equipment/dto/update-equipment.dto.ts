/**
 * @file apps/api/src/equipment/dto/update-equipment.dto.ts
 * @description 설비 수정 DTO
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentStatus, Criticality } from '@prisma/client';

class SparePartDto {
  @IsString()
  materialId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateEquipmentDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

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

  @IsDateString()
  @IsOptional()
  installDate?: string;

  @IsDateString()
  @IsOptional()
  warrantyEndDate?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @IsOptional()
  purchaseCost?: number;

  @IsOptional()
  specifications?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SparePartDto)
  @IsOptional()
  sparePartIds?: SparePartDto[];
}
