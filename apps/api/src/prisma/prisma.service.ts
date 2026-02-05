/**
 * @file apps/api/src/prisma/prisma.service.ts
 * @description Prisma 클라이언트 서비스
 *
 * 초보자 가이드:
 * 1. **역할**: Prisma Client를 NestJS 서비스로 래핑
 * 2. **사용법**: 다른 서비스에서 주입받아 DB 작업 수행
 * 3. **생명주기**: 앱 시작 시 연결, 종료 시 해제
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
