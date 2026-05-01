import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('personal_events')
export class PersonalEvent {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id!: string;

  @Column({ type: 'varchar', length: 20, name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: string;

  @Column({ type: 'varchar', length: 20, name: 'start_date' })
  startDate!: string;

  @Column({ type: 'varchar', length: 20, name: 'end_date' })
  endDate!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  half!: string | null;

  @Column({ type: 'varchar', length: 100 })
  label!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
