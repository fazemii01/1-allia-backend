import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ak_banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mobile_image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  href: string;

  @Column({ type: 'int', default: 1 })
  sort_order: number;

  @Column({ type: 'varchar', length: 50, default: 'hero' })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'int', default: 3 })
  popup_delay: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
