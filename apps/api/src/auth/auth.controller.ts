/**
 * @file apps/api/src/auth/auth.controller.ts
 * @description 인증 컨트롤러 - 로그인/회원가입 엔드포인트
 *
 * 엔드포인트:
 * - POST /auth/login - 로그인
 * - POST /auth/register - 회원가입
 * - GET /auth/me - 현재 사용자 정보
 */

import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    const { password, ...user } = req.user;
    return user;
  }
}
