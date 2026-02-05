/**
 * @file apps/api/src/app.controller.ts
 * @description 앱 컨트롤러 - 헬스 체크 및 기본 엔드포인트
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      name: 'FMS API',
      version: '0.0.1',
      status: 'running',
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
