import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsIn(['팀장', '매니저', '사원'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
