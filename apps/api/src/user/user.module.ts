/**
 * @file apps/api/src/user/user.module.ts
 * @description 사용자 관리 모듈
 *
 * 기능:
 * - 사용자 CRUD
 * - 역할 할당
 * - 프로필 관리
 */

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
