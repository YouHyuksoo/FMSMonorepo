/**
 * @file apps/api/src/prisma/prisma.module.ts
 * @description Prisma 데이터베이스 연결 모듈
 *
 * 초보자 가이드:
 * 1. **역할**: PostgreSQL 데이터베이스 연결 관리
 * 2. **사용법**: 다른 모듈에서 PrismaService를 주입받아 사용
 * 3. **Global**: 전역 모듈로 설정되어 import 없이 사용 가능
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
