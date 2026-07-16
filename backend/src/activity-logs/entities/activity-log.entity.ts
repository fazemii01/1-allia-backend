import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('ak_activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true, type: 'int' })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar', length: 50 })
  action: string; // 'create', 'update', 'delete', 'login', etc.

  @Column({ type: 'varchar', name: 'model_type', length: 100, nullable: true })
  modelType: string | null;

  @Column({ type: 'varchar', name: 'model_id', length: 100, nullable: true })
  modelId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  properties: any | null; // { old: ..., new: ... }

  @Column({ type: 'varchar', name: 'ip_address', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', name: 'user_agent', length: 255, nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
