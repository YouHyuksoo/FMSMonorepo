/**
 * @file apps/api/src/organization/dto/update-organization.dto.ts
 * @description 조직 수정 DTO
 */

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  @IsOptional()
  type?: OrganizationType;

  @IsString()
  @IsOptional()
  parentId?: string;
}
