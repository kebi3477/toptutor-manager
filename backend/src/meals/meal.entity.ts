import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('meal_days')
export class MealDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  date!: string;

  @Column({ name: 'week_start' })
  weekStart!: string;

  @Column({ name: 'day_name', length: 2 })
  day!: string;

  @Column({ type: 'jsonb', nullable: true })
  lunch!: string[] | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  holiday!: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
