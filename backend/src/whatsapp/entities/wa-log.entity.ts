import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('ak_wa_logs')
export class WaLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  patient_id: number;

  @Column({ type: 'varchar', length: 20 })
  recipient: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  patient_name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // registration_confirm | session_reminder | invoice | manual

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: string; // sent | failed

  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @CreateDateColumn()
  created_at: Date;
}
