import { IsHexColor, IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @Length(1, 50)
  @Matches(/^[a-z0-9_-]+$/, { message: 'id는 영문 소문자, 숫자, 하이픈, 언더스코어만 가능합니다.' })
  id!: string;

  @IsString()
  @Length(1, 50)
  name!: string;

  @IsHexColor()
  color!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
