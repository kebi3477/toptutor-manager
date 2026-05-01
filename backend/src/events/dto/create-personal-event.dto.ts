import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePersonalEventDto {
  @IsOptional() @IsString() @MaxLength(20)
  id?: string;

  @IsString() @MaxLength(20)
  userId!: string;

  @IsString() @MaxLength(20)
  type!: string;

  @IsString() @MaxLength(20)
  startDate!: string;

  @IsString() @MaxLength(20)
  endDate!: string;

  @IsOptional() @IsString() @MaxLength(5)
  half?: string;

  @IsString() @MaxLength(100)
  label!: string;
}
