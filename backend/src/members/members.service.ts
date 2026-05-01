import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

const FIRST_NAMES = ['지훈','서연','민준','수아','도윤','지유','시우','하은','준우','채원','은우','다은','지호','윤서','태민','서윤','우진','지원','승현','예린','현우','수빈','정우','민서','재현','다현','선우','유진','동현','하린'];
const LAST_NAMES  = ['김','이','박','최','정','강','조','윤','장','임','한','오','신','권','황','안','송','류','전','홍','문','양','손','배'];
const TEAM_IDS    = ['media','pr','math','sci','soc','kor1','kor2','eng1','eng2','gen','acc','design'];
const TEAM_SIZES  = [5, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4];

function makeName(seed: number): string {
  return LAST_NAMES[seed % LAST_NAMES.length] + FIRST_NAMES[(seed * 7) % FIRST_NAMES.length];
}

function generateSeedMembers(): Array<{ id: string; name: string; teamId: string; role: string }> {
  const out: Array<{ id: string; name: string; teamId: string; role: string }> = [];
  let id = 1;
  TEAM_IDS.forEach((teamId, ti) => {
    for (let i = 0; i < TEAM_SIZES[ti]; i++) {
      const seed = id * 13 + ti;
      out.push({
        id: `u${id}`,
        name: makeName(seed),
        teamId,
        role: i === 0 ? '팀장' : id % 11 === 0 ? '매니저' : '사원',
      });
      id++;
    }
  });
  return out;
}

@Injectable()
export class MembersService implements OnModuleInit {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<{ seeded: number }> {
    const count = await this.repo.count();
    if (count > 0) return { seeded: 0 };

    const entities = generateSeedMembers().map(d => this.repo.create(d));
    await this.repo.save(entities);
    return { seeded: entities.length };
  }

  findAll(): Promise<Member[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.repo.findOneBy({ id });
    if (!member) throw new NotFoundException(`사용자 '${id}'를 찾을 수 없습니다.`);
    return member;
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    let id = dto.id;
    if (!id) {
      const all = await this.repo.find();
      const max = all.reduce((m, r) => {
        const n = parseInt(r.id.replace(/\D/g, ''), 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 0);
      id = `u${max + 1}`;
    }
    const member = this.repo.create({ ...dto, id });
    return this.repo.save(member);
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(member, patch);
    return this.repo.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.repo.remove(member);
  }
}
