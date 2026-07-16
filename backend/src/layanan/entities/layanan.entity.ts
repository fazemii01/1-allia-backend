import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LayananCategory } from './layanan-category.entity';

export interface LayananStats {
  durasi_sesi: string;
  format_layanan: string;
  mulai_dari: string;
}

export interface LayananProgram {
  title: string;
  desc: string;
  harga: string;
}

@Entity('ak_layanan')
export class Layanan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  kategori_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  stats: LayananStats;

  @Column({ type: 'jsonb', nullable: true })
  mengapa_memilih: string[];

  @Column({ type: 'jsonb', nullable: true })
  isu_permasalahan: string[];

  @Column({ type: 'jsonb', nullable: true })
  programs: LayananProgram[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @ManyToOne(() => LayananCategory, (cat) => cat.layanan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kategori_id' })
  category: LayananCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
