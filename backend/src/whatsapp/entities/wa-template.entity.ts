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

  // Automation: which system event auto-sends this template. null = manual only.
  @Column({ type: 'varchar', length: 50, nullable: true })
  trigger_event: string | null; // apply_created | invoice_created | appointment_scheduled

  // Automation toggle — template only auto-sends when trigger_event set AND this is true
  @Column({ type: 'boolean', default: false })
  auto_send: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
