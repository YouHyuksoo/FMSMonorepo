/**
 * @file apps/api/src/maintenance/maintenance.module.ts
 * @description 유지보수 관리 모듈
 *
 * 워크플로우:
 * Request(요청) → Plan(계획) → Work(작업) → Complete(완료)
 *
 * 기능:
 * - 유지보수 요청 관리
 * - 유지보수 계획 수립
 * - 작업 배정 및 진행
 * - 자재 사용 관리
 */

import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { WorkService } from './work.service';
import { WorkController } from './work.controller';

@Module({
  controllers: [RequestController, PlanController, WorkController],
  providers: [RequestService, PlanService, WorkService],
  exports: [RequestService, PlanService, WorkService],
})
export class MaintenanceModule {}
