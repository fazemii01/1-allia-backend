import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ak_wa_templates')
export class WaTemplate {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string; // e.g. registration_confirm

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
