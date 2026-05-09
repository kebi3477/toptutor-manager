import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/user.entity';
import { AuthUser, AuthResponse } from './auth.types';

interface PendingSignup {
  passwordHash: string;
  code: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly pending = new Map<string, PendingSignup>();
  private readonly verified = new Set<string>();

  constructor(
    private readonly users: UsersService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
  ) {}

  async signup(userEmail: string, password: string): Promise<void> {
    const existing = await this.users.findByEmail(userEmail);
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const passwordHash = await bcrypt.hash(password, 10);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.pending.set(userEmail, { passwordHash, code, expiresAt });
    this.verified.delete(userEmail);

    try {
      await this.email.sendVerificationCode(userEmail, code);
    } catch (err) {
      this.pending.delete(userEmail);
      this.logger.error(`메일 발송 실패 (${userEmail}): ${(err as Error).message}`);
      throw new InternalServerErrorException('인증 메일 발송에 실패했습니다. SMTP 설정을 확인해주세요.');
    }
  }

  verifyEmail(userEmail: string, code: string): void {
    const entry = this.pending.get(userEmail);
    if (!entry) throw new BadRequestException('인증 요청을 찾을 수 없습니다. 다시 시도해주세요.');
    if (Date.now() > entry.expiresAt) {
      this.pending.delete(userEmail);
      throw new BadRequestException('인증 코드가 만료되었습니다. 재발송해주세요.');
    }
    if (entry.code !== code) throw new BadRequestException('인증 코드가 올바르지 않습니다.');

    this.verified.add(userEmail);
  }

  async completeSignup(userEmail: string, name: string, teamId?: string): Promise<AuthResponse> {
    if (!this.verified.has(userEmail)) {
      throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
    }

    const entry = this.pending.get(userEmail);
    if (!entry) throw new BadRequestException('인증 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.');

    const user = await this.users.create({
      email: userEmail,
      passwordHash: entry.passwordHash,
      name,
      teamId,
    });

    this.pending.delete(userEmail);
    this.verified.delete(userEmail);

    return this.buildAuthResponse(user);
  }

  async login(userEmail: string, password: string): Promise<AuthResponse> {
    const user = await this.users.findByEmail(userEmail);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    return this.buildAuthResponse(user);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.toAuthUser(user);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: this.toAuthUser(user) };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      teamId: user.teamId ?? null,
      role: user.role,
      isAdmin: user.isAdmin,
    };
  }
}
