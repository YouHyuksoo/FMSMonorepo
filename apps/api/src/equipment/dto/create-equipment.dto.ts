/**
 * @file apps/api/src/equipment/dto/create-equipment.dto.ts
 * @description 설비 생성 DTO
 */

import {
  IsNotEmpty,
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
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

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
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Organization ID is required' })
  organizationId: string;

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
