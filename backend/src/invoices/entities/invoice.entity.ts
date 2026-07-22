import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export interface InvoiceItem {
  description: string;
  amount: number;
}

@Entity('ak_invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoice_number: string;

  @Column({ type: 'varchar', length: 8, unique: true, nullable: true })
  invoice_token: string;

  @Column({ type: 'int' })
  patient_id: number;

  @Column({ type: 'int', nullable: true })
  appointment_id: number;

  @Column({ type: 'jsonb' })
  items: InvoiceItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  full_amount: number;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'transfer' })
  payment_method: string;

  @Column({ type: 'varchar', length: 20, default: 'belum_bayar' })
  status: string; // belum_bayar | sudah_bayar | jatuh_tempo | menunggu_verifikasi

  @Column({ type: 'varchar', length: 20, default: 'full' })
  payment_type: string; // full | dp | pelunasan

  @Column({ type: 'int', nullable: true })
  parent_invoice_id: number;

  @Column({ type: 'int', nullable: true, default: 50 })
  dp_percentage: number;

  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'timestamp', nullable: true })
  wa_sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_proof: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
