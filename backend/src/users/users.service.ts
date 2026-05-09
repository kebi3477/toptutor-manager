import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  teamId?: string;
  role?: string;
  isAdmin?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(data: CreateUserData): Promise<User> {
    const user = this.repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      ...(data.teamId !== undefined && { teamId: data.teamId }),
      role: data.role ?? '사원',
      isAdmin: data.isAdmin ?? false,
    });
    return this.repo.save(user) as Promise<User>;
  }
}
