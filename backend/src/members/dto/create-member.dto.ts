import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  id?: string;

  @IsString()
  @Length(2, 50)
  name!: string;

  @IsString()
  teamId!: string;

  @IsIn(['팀장', '매니저', '사원'])
  role!: string;
}
