import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  email!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 100, nullable: true, default: null })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'team_id', type: 'varchar', length: 50, nullable: true, default: null })
  teamId!: string | null;

  @Column({ type: 'varchar', length: 20, default: '사원' })
  role!: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
