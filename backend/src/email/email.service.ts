import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get('SMTP_HOST');
    const user = config.get('SMTP_USER');
    const pass = config.get('SMTP_PASS');

    if (host && user && pass) {
      const port = Number(config.get('SMTP_PORT', '465'));
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const from = this.config.get('SMTP_FROM', '마더텅 매니저 <noreply@mothertongue.co.kr>');

    if (!this.transporter) {
      this.logger.warn(`[SMTP 미설정] 인증 코드 → ${to} : ${code}`);
      return;
    }

    await this.transporter.sendMail({
      from,
      to,
      subject: '[마더텅 매니저] 이메일 인증 코드',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #FEA32B;">마더텅 매니저</h2>
          <p>아래 인증 코드를 입력해 회원가입을 완료해주세요.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;
                      background: #FAFAF7; border: 1px solid #F0EFE9; border-radius: 8px;
                      padding: 20px; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #4D4A40; font-size: 13px;">코드는 10분간 유효합니다.</p>
        </div>
      `,
    });
  }
}
