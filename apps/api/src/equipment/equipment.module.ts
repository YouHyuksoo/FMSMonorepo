/**
 * @file apps/api/src/equipment/equipment.module.ts
 * @description 설비 관리 모듈
 *
 * 기능:
 * - 설비 CRUD
 * - 설비 카테고리 관리
 * - 설비 위치 관리
 * - 설비 문서 관리
 * - 예비품 관리
 */

import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  controllers: [EquipmentController, CategoryController, LocationController],
  providers: [EquipmentService, CategoryService, LocationService],
  exports: [EquipmentService, CategoryService, LocationService],
})
export class EquipmentModule {}
