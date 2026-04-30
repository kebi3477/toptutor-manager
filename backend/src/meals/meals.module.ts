import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealDay } from './meal.entity';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealDay])],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}
