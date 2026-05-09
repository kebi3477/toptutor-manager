import { IsEmail, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @Length(6, 6, { message: '6자리 코드를 입력해주세요.' })
  code: string;
}
