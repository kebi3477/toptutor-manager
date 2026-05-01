import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_events')
export class CompanyEvent {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  date!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'start_date' })
  startDate!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'end_date' })
  endDate!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  time!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location!: string | null;

  @Column({ type: 'varchar', length: 20 })
  type!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
