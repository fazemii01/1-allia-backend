import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ak_wa_auto_replies')
export class WaAutoReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  keyword: string; // matched case-insensitively; "*" = catch-all

  @Column({ type: 'text' })
  reply_body: string;

  @Column({ type: 'varchar', length: 20, default: 'contains' })
  match_type: string; // contains | exact

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
