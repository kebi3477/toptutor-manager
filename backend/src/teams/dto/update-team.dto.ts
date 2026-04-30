import { IsHexColor, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
