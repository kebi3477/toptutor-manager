import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyEventDto } from './create-company-event.dto';

export class UpdateCompanyEventDto extends PartialType(CreateCompanyEventDto) {}
