import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalEventDto } from './create-personal-event.dto';

export class UpdatePersonalEventDto extends PartialType(CreatePersonalEventDto) {}
