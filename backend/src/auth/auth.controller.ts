import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthResponse, AuthUser } from './auth.types';
import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CompleteSignupDto } from './dto/complete-signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    await this.auth.signup(dto.email, dto.password);
    return { message: '인증 메일이 발송되었습니다.' };
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    this.auth.verifyEmail(dto.email, dto.code);
    return { message: '이메일 인증이 완료되었습니다.' };
  }

  @Post('complete-signup')
  completeSignup(@Body() dto: CompleteSignupDto): Promise<AuthResponse> {
    return this.auth.completeSignup(dto.email, dto.name, dto.teamId, dto.role);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: { id: string } }): Promise<AuthUser> {
    return this.auth.getMe(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.auth.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
    return { message: '비밀번호가 변경되었습니다.' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.auth.forgotPassword(dto.email);
    return { message: '비밀번호 재설정 메일이 발송되었습니다.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.auth.resetPassword(dto.email, dto.code, dto.newPassword);
    return { message: '비밀번호가 재설정되었습니다.' };
  }
}
