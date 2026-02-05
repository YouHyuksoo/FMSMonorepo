/**
 * @file apps/api/src/material/material.module.ts
 * @description 자재 관리 모듈
 *
 * 기능:
 * - 자재 마스터 CRUD
 * - 자재 카테고리 관리
 * - 창고 관리
 * - 재고 관리
 * - 입출고 트랜잭션
 */

import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  controllers: [MaterialController, WarehouseController, StockController],
  providers: [MaterialService, WarehouseService, StockService],
  exports: [MaterialService, WarehouseService, StockService],
})
export class MaterialModule {}
