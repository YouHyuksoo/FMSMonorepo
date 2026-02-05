/**
 * @file apps/api/src/app.module.ts
 * @description FMS API 루트 모듈
 *
 * 초보자 가이드:
 * 1. **역할**: 모든 모듈을 조합하는 루트 모듈
 * 2. **구성**:
 *    - ConfigModule: 환경 변수 관리
 *    - PrismaModule: 데이터베이스 연결
 *    - AuthModule: 인증/인가
 *    - UserModule: 사용자 관리
 *    - OrganizationModule: 조직 관리
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { EquipmentModule } from './equipment/equipment.module';
import { MaterialModule } from './material/material.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { InspectionModule } from './inspection/inspection.module';

@Module({
  imports: [
    // 환경 변수 설정 (전역)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 데이터베이스 (전역)
    PrismaModule,

    // 기능 모듈
    AuthModule,
    UserModule,
    OrganizationModule,

    // 도메인 모듈
    EquipmentModule,
    MaterialModule,
    MaintenanceModule,
    InspectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
