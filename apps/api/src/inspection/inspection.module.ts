/**
 * @file apps/api/src/inspection/inspection.module.ts
 * @description 점검 관리 모듈
 *
 * 기능:
 * - 점검 마스터 관리
 * - 점검 일정 관리
 * - 점검 결과 기록
 */

import { Module } from '@nestjs/common';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';

@Module({
  controllers: [MasterController, ScheduleController, ResultController],
  providers: [MasterService, ScheduleService, ResultService],
  exports: [MasterService, ScheduleService, ResultService],
})
export class InspectionModule {}
