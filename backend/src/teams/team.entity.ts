import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column()
  name!: string;

  @Column({ length: 9 })
  color!: string;

  @Column({ default: 0 })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
