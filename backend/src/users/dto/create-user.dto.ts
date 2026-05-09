import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  id?: string;

  @IsString()
  @Length(2, 50)
  name!: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsIn(['팀장', '매니저', '사원'])
  role?: string;
}
