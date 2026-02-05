/**
 * @file apps/api/src/main.ts
 * @description FMS API 서버 진입점
 *
 * 설정:
 * - 포트: 4000 (기본값)
 * - CORS: 활성화
 * - Validation: class-validator 사용
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);

  // Global Prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
  logger.log(`🚀 FMS API Server running on http://localhost:${port}`);
  logger.log(`📖 API endpoints available at http://localhost:${port}/api`);
}

bootstrap();
