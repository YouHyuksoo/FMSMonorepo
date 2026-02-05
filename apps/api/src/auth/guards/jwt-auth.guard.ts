/**
 * @file apps/api/src/auth/guards/jwt-auth.guard.ts
 * @description JWT 인증 가드 - 보호된 라우트에 사용
 *
 * 사용법:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtected() { ... }
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
