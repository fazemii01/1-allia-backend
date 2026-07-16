import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ak_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 30, unique: true })
  whatsapp: string;

  @Index()
  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  email: string | null;

  @Column({ name: 'password_hash' })
  password_hash: string;

  /** Role: 'admin' | 'staff' | 'user' (parent/patient side) */
  @Column({ default: 'user', length: 20 })
  role: string;

  @Column({ name: 'child_name', length: 150, nullable: true })
  child_name: string;

  @Column({ name: 'child_age', nullable: true, type: 'int' })
  child_age: number;

  @Column({ name: 'child_tempat_lahir', length: 100, nullable: true })
  child_tempat_lahir: string;

  @Column({ name: 'child_tanggal_lahir', type: 'date', nullable: true })
  child_tanggal_lahir: string;

  @Column({ name: 'child_jenis_kelamin', length: 20, nullable: true })
  child_jenis_kelamin: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photo_url: string | null;

  @Column({ name: 'bio', type: 'varchar', length: 255, nullable: true })
  bio: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
