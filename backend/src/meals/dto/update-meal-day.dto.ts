import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateMealDayDto {
  // 신규 생성 시 필요 (기존 레코드가 없을 때)
  @IsOptional()
  @IsString()
  weekStart?: string;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lunch?: string[] | null;

  @IsOptional()
  @IsString()
  holiday?: string | null;
}
