import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEvent } from './company-event.entity';
import { PersonalEvent } from './personal-event.entity';
import { CreateCompanyEventDto } from './dto/create-company-event.dto';
import { CreatePersonalEventDto } from './dto/create-personal-event.dto';
import { UpdateCompanyEventDto } from './dto/update-company-event.dto';
import { UpdatePersonalEventDto } from './dto/update-personal-event.dto';

const COMPANY_SEED: Omit<CompanyEvent, 'createdAt' | 'updatedAt'>[] = [
  { id: 'c1', title: '월례 전사 미팅',      date: '2026-04-30', startDate: null, endDate: null, time: '14:00', location: '본사 대강당',  type: 'meeting' },
  { id: 'c2', title: '신간 출시 컨퍼런스',  date: '2026-05-07', startDate: null, endDate: null, time: '10:00', location: '강남 컨벤션',  type: 'event'   },
  { id: 'c3', title: '체육대회',            date: '2026-05-15', startDate: '2026-05-15', endDate: '2026-05-15', time: '09:00', location: '한강공원', type: 'event' },
  { id: 'c4', title: '근로자의 날 (휴무)',  date: '2026-05-01', startDate: null, endDate: null, time: null, location: null, type: 'holiday' },
  { id: 'c5', title: '어린이날 (휴무)',     date: '2026-05-05', startDate: null, endDate: null, time: null, location: null, type: 'holiday' },
  { id: 'c6', title: '편집부 워크숍',       date: '2026-05-22', startDate: '2026-05-22', endDate: '2026-05-23', time: null, location: '양평 연수원', type: 'event' },
  { id: 'c7', title: '분기 실적 보고',      date: '2026-04-29', startDate: null, endDate: null, time: '15:00', location: '대회의실',    type: 'meeting' },
];

const PERSONAL_SEED: Omit<PersonalEvent, 'createdAt' | 'updatedAt'>[] = [
  { id: 'p1',  userId: 'u3',  type: 'leave', startDate: '2026-04-29', endDate: '2026-04-30', half: null, label: '연차' },
  { id: 'p2',  userId: 'u8',  type: 'leave', startDate: '2026-04-30', endDate: '2026-05-04', half: null, label: '연차' },
  { id: 'p3',  userId: 'u14', type: 'half',  startDate: '2026-04-30', endDate: '2026-04-30', half: 'PM', label: '오후 반차' },
  { id: 'p4',  userId: 'u22', type: 'leave', startDate: '2026-04-28', endDate: '2026-04-30', half: null, label: '연차' },
  { id: 'p5',  userId: 'u31', type: 'half',  startDate: '2026-04-30', endDate: '2026-04-30', half: 'AM', label: '오전 반차' },
  { id: 'p6',  userId: 'u5',  type: 'leave', startDate: '2026-05-04', endDate: '2026-05-06', half: null, label: '연차' },
  { id: 'p7',  userId: 'u12', type: 'leave', startDate: '2026-05-08', endDate: '2026-05-08', half: null, label: '연차' },
  { id: 'p8',  userId: 'u17', type: 'half',  startDate: '2026-05-04', endDate: '2026-05-04', half: 'PM', label: '오후 반차' },
  { id: 'p9',  userId: 'u20', type: 'leave', startDate: '2026-05-11', endDate: '2026-05-13', half: null, label: '연차' },
  { id: 'p10', userId: 'u25', type: 'leave', startDate: '2026-05-07', endDate: '2026-05-07', half: null, label: '연차' },
  { id: 'p11', userId: 'u28', type: 'half',  startDate: '2026-05-12', endDate: '2026-05-12', half: 'AM', label: '오전 반차' },
  { id: 'p12', userId: 'u33', type: 'leave', startDate: '2026-05-18', endDate: '2026-05-20', half: null, label: '연차' },
  { id: 'p13', userId: 'u40', type: 'leave', startDate: '2026-05-06', endDate: '2026-05-06', half: null, label: '연차' },
  { id: 'p14', userId: 'u15', type: 'leave', startDate: '2026-05-11', endDate: '2026-05-12', half: null, label: '연차 (예정)' },
  { id: 'p15', userId: 'u44', type: 'half',  startDate: '2026-05-15', endDate: '2026-05-15', half: 'AM', label: '오전 반차' },
  { id: 'p16', userId: 'u9',  type: 'leave', startDate: '2026-05-26', endDate: '2026-05-29', half: null, label: '연차' },
  { id: 'p17', userId: 'u18', type: 'leave', startDate: '2026-05-13', endDate: '2026-05-13', half: null, label: '연차' },
  { id: 'p18', userId: 'u36', type: 'leave', startDate: '2026-05-21', endDate: '2026-05-22', half: null, label: '연차' },
];

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(CompanyEvent)
    private readonly companyRepo: Repository<CompanyEvent>,
    @InjectRepository(PersonalEvent)
    private readonly personalRepo: Repository<PersonalEvent>,
  ) {}

  async onModuleInit() {
    const companyCount = await this.companyRepo.count();
    if (companyCount === 0) {
      await this.companyRepo.save(COMPANY_SEED as CompanyEvent[]);
    }

    const personalCount = await this.personalRepo.count();
    if (personalCount === 0) {
      await this.personalRepo.save(PERSONAL_SEED as PersonalEvent[]);
    }
  }

  // ── Company events ────────────────────────────────────────────────────────

  findAllCompany(): Promise<CompanyEvent[]> {
    return this.companyRepo.find({ order: { date: 'ASC' } });
  }

  async createCompany(dto: CreateCompanyEventDto): Promise<CompanyEvent> {
    const id = dto.id ?? `c${Date.now()}`;
    const event = this.companyRepo.create({ ...dto, id });
    return this.companyRepo.save(event);
  }

  async updateCompany(id: string, dto: UpdateCompanyEventDto): Promise<CompanyEvent> {
    const event = await this.companyRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`CompanyEvent ${id} not found`);
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(event, patch);
    return this.companyRepo.save(event);
  }

  async removeCompany(id: string): Promise<void> {
    const event = await this.companyRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`CompanyEvent ${id} not found`);
    await this.companyRepo.remove(event);
  }

  // ── Personal events ───────────────────────────────────────────────────────

  findAllPersonal(): Promise<PersonalEvent[]> {
    return this.personalRepo.find({ order: { startDate: 'ASC' } });
  }

  async createPersonal(dto: CreatePersonalEventDto): Promise<PersonalEvent> {
    const id = dto.id ?? `p${Date.now()}`;
    const event = this.personalRepo.create({ ...dto, id });
    return this.personalRepo.save(event);
  }

  async updatePersonal(id: string, dto: UpdatePersonalEventDto): Promise<PersonalEvent> {
    const event = await this.personalRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`PersonalEvent ${id} not found`);
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(event, patch);
    return this.personalRepo.save(event);
  }

  async removePersonal(id: string): Promise<void> {
    const event = await this.personalRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`PersonalEvent ${id} not found`);
    await this.personalRepo.remove(event);
  }
}
