import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

const SEED_DATA: Array<{ id: string; name: string; color: string; order: number }> = [
  { id: 'media', name: '미디어팀',    color: '#7C8DB5', order: 0  },
  { id: 'pr',    name: '홍보팀',      color: '#C28B8B', order: 1  },
  { id: 'math',  name: '수학팀',      color: '#5B8DA8', order: 2  },
  { id: 'sci',   name: '과탐팀',      color: '#6FA890', order: 3  },
  { id: 'soc',   name: '사탐팀',      color: '#B89260', order: 4  },
  { id: 'kor1',  name: '국어기출팀',  color: '#8B7BAB', order: 5  },
  { id: 'kor2',  name: '국어독해팀',  color: '#A87B9D', order: 6  },
  { id: 'eng1',  name: '영어듣기팀',  color: '#5F95A8', order: 7  },
  { id: 'eng2',  name: '영어기출팀',  color: '#7BA08A', order: 8  },
  { id: 'gen',   name: '총무팀',      color: '#9C8E7E', order: 9  },
  { id: 'acc',   name: '경리팀',      color: '#A89270', order: 10 },
  { id: 'design',name: '디자인팀',    color: '#C2854A', order: 11 },
];

@Injectable()
export class TeamsService implements OnModuleInit {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<{ seeded: number }> {
    const count = await this.repo.count();
    if (count > 0) return { seeded: 0 };

    const entities = SEED_DATA.map((d) => this.repo.create(d));
    await this.repo.save(entities);
    return { seeded: entities.length };
  }

  findAll(): Promise<Team[]> {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.repo.findOneBy({ id });
    if (!team) throw new NotFoundException(`팀 '${id}'을 찾을 수 없습니다.`);
    return team;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const exists = await this.repo.findOneBy({ id: dto.id });
    if (exists) throw new ConflictException(`id '${dto.id}'는 이미 사용 중입니다.`);

    const maxOrder = await this.repo.maximum('order');
    const team = this.repo.create({
      ...dto,
      order: dto.order ?? (maxOrder ?? -1) + 1,
    });
    return this.repo.save(team);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, dto);
    return this.repo.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.repo.remove(team);
  }
}
