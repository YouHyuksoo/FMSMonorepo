/**
 * @file apps/api/src/organization/organization.module.ts
 * @description 조직 관리 모듈
 *
 * 기능:
 * - 조직 CRUD
 * - 계층형 조직 구조 관리
 */

import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
