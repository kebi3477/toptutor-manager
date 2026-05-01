import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ name: 'team_id', length: 50 })
  teamId!: string;

  @Column({ length: 20 })
  role!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
