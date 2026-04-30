import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealDay } from './meal.entity';
import { UpdateMealDayDto } from './dto/update-meal-day.dto';

const SEED_DATA: Array<{ weekStart: string; days: Array<{ date: string; day: string; lunch: string[] | null; holiday?: string }> }> = [
  {
    weekStart: '2026-04-27',
    days: [
      { date: '2026-04-27', day: '월', lunch: ['김치찌개', '제육볶음', '콩나물무침', '오이무침', '쌀밥', '요거트'] },
      { date: '2026-04-28', day: '화', lunch: ['된장찌개', '갈치구이', '시래기무침', '계란찜', '쌀밥', '과일'] },
      { date: '2026-04-29', day: '수', lunch: ['부대찌개', '돈까스', '양배추샐러드', '단무지', '쌀밥', '아이스크림'] },
      { date: '2026-04-30', day: '목', lunch: ['육개장', '순살치킨', '겉절이', '감자조림', '쌀밥', '수박'] },
      { date: '2026-05-01', day: '금', lunch: null, holiday: '근로자의 날' },
    ],
  },
  {
    weekStart: '2026-05-04',
    days: [
      { date: '2026-05-04', day: '월', lunch: ['김치찜', '불고기', '시금치나물', '맛김', '쌀밥', '식혜'] },
      { date: '2026-05-05', day: '화', lunch: null, holiday: '어린이날' },
      { date: '2026-05-06', day: '수', lunch: ['순두부찌개', '제육볶음', '도라지무침', '단호박샐러드', '쌀밥', '요거트'] },
      { date: '2026-05-07', day: '목', lunch: ['짜장면', '탕수육', '단무지', '양파', '군만두', '콜라'] },
      { date: '2026-05-08', day: '금', lunch: ['삼계탕', '겉절이', '부추전', '과일샐러드', '쌀밥', '수정과'] },
    ],
  },
  {
    weekStart: '2026-05-11',
    days: [
      { date: '2026-05-11', day: '월', lunch: ['갈비찜', '잡채', '김치', '콩나물국', '쌀밥', '과일'] },
      { date: '2026-05-12', day: '화', lunch: ['비빔밥', '미역국', '계란후라이', '튀김', '요거트'] },
      { date: '2026-05-13', day: '수', lunch: ['뼈해장국', '고추장불고기', '콩나물', '김', '쌀밥', '식혜'] },
      { date: '2026-05-14', day: '목', lunch: ['우동', '김밥', '단무지', '어묵', '과일', '요거트'] },
      { date: '2026-05-15', day: '금', lunch: ['도시락 (체육대회)', '샌드위치', '과일', '음료', '샐러드', '김밥'] },
    ],
  },
];

@Injectable()
export class MealsService implements OnModuleInit {
  constructor(
    @InjectRepository(MealDay)
    private readonly repo: Repository<MealDay>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<{ seeded: number }> {
    const count = await this.repo.count();
    if (count > 0) return { seeded: 0 };

    const entities: Partial<MealDay>[] = [];
    for (const week of SEED_DATA) {
      for (const d of week.days) {
        entities.push({
          date: d.date,
          weekStart: week.weekStart,
          day: d.day,
          lunch: d.lunch,
          holiday: d.holiday ?? null,
        });
      }
    }

    await this.repo.save(entities as MealDay[]);
    return { seeded: entities.length };
  }

  async getWeeks(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('m')
      .select('DISTINCT m.week_start', 'weekStart')
      .orderBy('m.week_start', 'ASC')
      .getRawMany<{ weekStart: string }>();

    return rows.map((r) => r.weekStart);
  }

  async getWeek(weekStart: string): Promise<MealDay[]> {
    return this.repo.find({
      where: { weekStart },
      order: { date: 'ASC' },
    });
  }

  async updateDay(date: string, dto: UpdateMealDayDto): Promise<MealDay> {
    const day = await this.repo.findOneBy({ date });
    if (!day) throw new NotFoundException(`식단 데이터가 없습니다: ${date}`);

    if (dto.lunch !== undefined) day.lunch = dto.lunch;
    if (dto.holiday !== undefined) day.holiday = dto.holiday ?? null;

    return this.repo.save(day);
  }
}
