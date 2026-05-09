import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompleteSignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @IsOptional()
  @IsString()
  teamId?: string;
}
