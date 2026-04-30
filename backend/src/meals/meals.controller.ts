import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MealsService } from './meals.service';
import { UpdateMealDayDto } from './dto/update-meal-day.dto';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get('weeks')
  getWeeks() {
    return this.mealsService.getWeeks();
  }

  @Get()
  getWeek(@Query('week') week: string) {
    return this.mealsService.getWeek(week);
  }

  @Put(':date')
  updateDay(@Param('date') date: string, @Body() dto: UpdateMealDayDto) {
    return this.mealsService.updateDay(date, dto);
  }

  @Post('seed')
  seed() {
    return this.mealsService.seed();
  }
}
