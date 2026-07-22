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

export interface AspectScores {
  atensi_fokus?: number;
  artikulasi_wicara?: number;
  regulasi_emosi?: number;
  kepatuhan_instruksi?: number;
  sosialisasi?: number;
}

@Entity('ak_therapy_progress_logs')
export class TherapyProgressLog {
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

  @Column({ type: 'varchar', length: 255, default: 'Program Terapi & Stimulasi' })
  program_name: string;

  @Column({ type: 'int', default: 8 })
  total_sessions: number;

  @Column({ type: 'int', default: 1 })
  session_number: number;

  @Column({ type: 'date', nullable: true })
  session_date: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fokus_latihan: string;

  @Column({ type: 'int', default: 80 })
  progress_score: number;

  @Column({ type: 'jsonb', nullable: true })
  aspect_scores: AspectScores;

  @Column({ type: 'text', nullable: true })
  catatan_terapis: string;

  @Column({ type: 'text', nullable: true })
  rekomendasi_ortu: string;

  @Column({ type: 'varchar', length: 50, default: 'sesuai_target' })
  status_pencapaian: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
