import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEvent } from './company-event.entity';
import { PersonalEvent } from './personal-event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEvent, PersonalEvent])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
