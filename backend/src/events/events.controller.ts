import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateCompanyEventDto } from './dto/create-company-event.dto';
import { CreatePersonalEventDto } from './dto/create-personal-event.dto';
import { UpdateCompanyEventDto } from './dto/update-company-event.dto';
import { UpdatePersonalEventDto } from './dto/update-personal-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get('company')
  getAllCompany() {
    return this.service.findAllCompany();
  }

  @Post('company')
  createCompany(@Body() dto: CreateCompanyEventDto) {
    return this.service.createCompany(dto);
  }

  @Put('company/:id')
  updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyEventDto) {
    return this.service.updateCompany(id, dto);
  }

  @Delete('company/:id')
  removeCompany(@Param('id') id: string) {
    return this.service.removeCompany(id);
  }

  @Get('personal')
  getAllPersonal() {
    return this.service.findAllPersonal();
  }

  @Post('personal')
  createPersonal(@Body() dto: CreatePersonalEventDto) {
    return this.service.createPersonal(dto);
  }

  @Put('personal/:id')
  updatePersonal(@Param('id') id: string, @Body() dto: UpdatePersonalEventDto) {
    return this.service.updatePersonal(id, dto);
  }

  @Delete('personal/:id')
  removePersonal(@Param('id') id: string) {
    return this.service.removePersonal(id);
  }
}
