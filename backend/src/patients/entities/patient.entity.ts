import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Therapist } from '../../therapists/entities/therapist.entity';

@Entity('ak_patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nama_lengkap', length: 200 })
  nama_lengkap: string;

  @Column({ nullable: true, type: 'int' })
  usia: number;

  @Column({ name: 'tempat_lahir', length: 100, nullable: true })
  tempat_lahir: string;

  @Column({ name: 'tanggal_lahir', type: 'date', nullable: true })
  tanggal_lahir: string;

  @Column({ name: 'jenis_kelamin', length: 20, nullable: true })
  jenis_kelamin: string;

  @Column({ name: 'email_ortu', length: 150, nullable: true })
  email_ortu: string;

  @Column({ name: 'no_telepon', length: 30, nullable: true })
  no_telepon: string;

  @Column({ name: 'nama_ayah', length: 150, nullable: true })
  nama_ayah: string;

  @Column({ name: 'nama_ibu', length: 150, nullable: true })
  nama_ibu: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ name: 'jenis_terapi', length: 100, nullable: true })
  jenis_terapi: string;

  @Column({ name: 'pendidikan_anak', length: 100, nullable: true })
  pendidikan_anak: string;

  @Column({ name: 'relasi_sosial', length: 200, nullable: true })
  relasi_sosial: string;

  @Column({ name: 'relasi_dengan_ibu', length: 200, nullable: true })
  relasi_dengan_ibu: string;

  @Column({ name: 'relasi_dengan_saudara', length: 200, nullable: true })
  relasi_dengan_saudara: string;

  @Column({ name: 'formulir_wicara', type: 'jsonb', nullable: true })
  formulir_wicara: Record<string, any>;

  @Column({ name: 'formulir_hipoterapi', type: 'jsonb', nullable: true })
  formulir_hipoterapi: Record<string, any>;

  @Column({ default: 'baru', length: 30 })
  status: string;

  @Column({ name: 'therapist_id', nullable: true, type: 'int' })
  therapist_id: number;

  @ManyToOne(() => Therapist, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'therapist_id' })
  therapist: Therapist;

  @Column({ name: 'catatan_internal', type: 'text', nullable: true })
  catatan_internal: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
