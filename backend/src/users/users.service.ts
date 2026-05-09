import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const FIRST_NAMES = ['지훈','서연','민준','수아','도윤','지유','시우','하은','준우','채원','은우','다은','지호','윤서','태민','서윤','우진','지원','승현','예린','현우','수빈','정우','민서','재현','다현','선우','유진','동현','하린'];
const LAST_NAMES  = ['김','이','박','최','정','강','조','윤','장','임','한','오','신','권','황','안','송','류','전','홍','문','양','손','배'];
const TEAM_IDS    = ['media','pr','math','sci','soc','kor1','kor2','eng1','eng2','gen','acc','design'];
const TEAM_SIZES  = [5, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4];

function makeName(seed: number): string {
  return LAST_NAMES[seed % LAST_NAMES.length] + FIRST_NAMES[(seed * 7) % FIRST_NAMES.length];
}

function generateSeedUsers(): Array<{ id: string; name: string; teamId: string; role: string }> {
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

interface CreateAuthUserData {
  email: string;
  passwordHash: string;
  name: string;
  teamId?: string;
  role?: string;
  isAdmin?: boolean;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<{ seeded: number }> {
    const count = await this.repo.count();
    if (count > 0) return { seeded: 0 };

    const entities = generateSeedUsers().map(d => this.repo.create(d));
    await this.repo.save(entities);
    return { seeded: entities.length };
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`사용자 '${id}'를 찾을 수 없습니다.`);
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repo.update(id, { passwordHash });
  }

  async createFromAuth(data: CreateAuthUserData): Promise<User> {
    const user = this.repo.create({
      id: randomUUID(),
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      teamId: data.teamId ?? null,
      role: data.role ?? '사원',
      isAdmin: data.isAdmin ?? false,
    });
    return this.repo.save(user) as Promise<User>;
  }

  async create(dto: CreateUserDto): Promise<User> {
    let id = dto.id;
    if (!id) {
      const all = await this.repo.find({ select: { id: true } });
      const max = all.reduce((m, r) => {
        const n = parseInt(r.id.replace(/\D/g, ''), 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 0);
      id = `u${max + 1}`;
    }
    const user = this.repo.create({
      id,
      name: dto.name,
      teamId: dto.teamId ?? null,
      role: dto.role ?? '사원',
    });
    return this.repo.save(user) as Promise<User>;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(user, patch);
    return this.repo.save(user) as Promise<User>;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
