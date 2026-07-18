import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Therapist } from '../../therapists/entities/therapist.entity';

@Entity('ak_appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id', type: 'int' })
  patient_id: number;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'therapist_id', type: 'int', nullable: true })
  therapist_id: number | null;

  @ManyToOne(() => Therapist, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'therapist_id' })
  therapist: Therapist;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduled_at: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  duration_minutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'dijadwalkan', length: 30 })
  status: string;

  @Column({ name: 'reminder_sent', default: false })
  reminder_sent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
