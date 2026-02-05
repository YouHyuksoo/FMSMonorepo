/**
 * @file apps/api/src/organization/dto/create-organization.dto.ts
 * @description 조직 생성 DTO
 */

import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  type: OrganizationType;

  @IsString()
  @IsOptional()
  parentId?: string;
}
