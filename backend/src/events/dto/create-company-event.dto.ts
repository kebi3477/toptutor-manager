import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateCompanyEventDto {
  @IsString() @MaxLength(20)
  id!: string;

  @IsString() @MaxLength(200)
  title!: string;

  @IsOptional() @IsString() @MaxLength(20)
  date?: string;

  @IsOptional() @IsString() @MaxLength(20)
  startDate?: string;

  @IsOptional() @IsString() @MaxLength(20)
  endDate?: string;

  @IsOptional() @IsString() @MaxLength(20)
  time?: string;

  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @IsString() @MaxLength(20)
  type!: string;
}
