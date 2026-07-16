import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export interface ResourceActions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

@Entity('ak_role_permissions')
@Unique(['role', 'resource'])
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  role: string; // staff | user

  @Column({ type: 'varchar', length: 50 })
  resource: string; // patients | appointments | invoices | therapists | layanan | edukasi | whatsapp

  @Column({ type: 'jsonb' })
  actions: ResourceActions;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
