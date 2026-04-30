import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateMealDayDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lunch?: string[] | null;

  @IsOptional()
  @IsString()
  holiday?: string | null;
}
