import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission, ResourceActions } from './entities/role-permission.entity';

// ─── Default permission matrices ──────────────────────────────────────────────
const RESOURCES = [
  'patients',
  'appointments',
  'invoices',
  'therapists',
  'layanan',
  'edukasi',
  'whatsapp',
];

export const DEFAULT_PERMISSIONS: Record<string, Record<string, ResourceActions>> = {
  staff: {
    patients:     { view: true,  create: true,  update: true,  delete: false },
    appointments: { view: true,  create: true,  update: true,  delete: false },
    invoices:     { view: true,  create: false, update: false, delete: false },
    therapists:   { view: true,  create: false, update: false, delete: false },
    layanan:      { view: true,  create: false, update: false, delete: false },
    edukasi:      { view: true,  create: true,  update: true,  delete: false },
    whatsapp:     { view: true,  create: true,  update: false, delete: false },
  },
  user: {
    patients:     { view: true,  create: false, update: false, delete: false },
    appointments: { view: true,  create: false, update: false, delete: false },
    invoices:     { view: true,  create: false, update: false, delete: false },
    therapists:   { view: false, create: false, update: false, delete: false },
    layanan:      { view: true,  create: false, update: false, delete: false },
    edukasi:      { view: true,  create: false, update: false, delete: false },
    whatsapp:     { view: false, create: false, update: false, delete: false },
  },
};

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repo: Repository<RolePermission>,
  ) {}

  // Get all permissions grouped by role
  async findAll(): Promise<Record<string, Record<string, ResourceActions>>> {
    const records = await this.repo.find({ order: { role: 'ASC', resource: 'ASC' } });
    const result: Record<string, Record<string, ResourceActions>> = {};
    for (const r of records) {
      if (!result[r.role]) result[r.role] = {};
      result[r.role][r.resource] = r.actions;
    }
    return result;
  }

  // Get permissions for a specific role
  async findByRole(role: string): Promise<Record<string, ResourceActions>> {
    // Admin always has full access — no DB lookup needed
    if (role === 'admin') {
      return RESOURCES.reduce((acc, res) => {
        acc[res] = { view: true, create: true, update: true, delete: true };
        return acc;
      }, {} as Record<string, ResourceActions>);
    }

    const records = await this.repo.find({ where: { role } });
    if (!records.length) {
      // Fall back to defaults if not yet seeded
      return DEFAULT_PERMISSIONS[role] ?? {};
    }
    return records.reduce((acc, r) => {
      acc[r.resource] = r.actions;
      return acc;
    }, {} as Record<string, ResourceActions>);
  }

  // Check a single permission
  async can(role: string, resource: string, action: keyof ResourceActions): Promise<boolean> {
    if (role === 'admin') return true;
    const permissions = await this.findByRole(role);
    return permissions[resource]?.[action] ?? false;
  }

  // Upsert a single role+resource permission
  async upsert(
    role: string,
    resource: string,
    actions: Partial<ResourceActions>,
  ): Promise<RolePermission> {
    let record = await this.repo.findOne({ where: { role, resource } });
    if (!record) {
      record = this.repo.create({
        role,
        resource,
        actions: DEFAULT_PERMISSIONS[role]?.[resource] ?? {
          view: false,
          create: false,
          update: false,
          delete: false,
        },
      });
    }
    record.actions = { ...record.actions, ...actions };
    return this.repo.save(record);
  }

  // Bulk update a role's full permission set
  async updateRole(
    role: string,
    permissions: Record<string, ResourceActions>,
  ): Promise<Record<string, ResourceActions>> {
    for (const [resource, actions] of Object.entries(permissions)) {
      await this.upsert(role, resource, actions);
    }
    return this.findByRole(role);
  }

  // Reset a role back to defaults
  async resetToDefault(role: string): Promise<Record<string, ResourceActions>> {
    const defaults = DEFAULT_PERMISSIONS[role];
    if (!defaults) throw new NotFoundException(`No defaults for role "${role}"`);
    await this.repo.delete({ role });
    for (const [resource, actions] of Object.entries(defaults)) {
      await this.repo.save(this.repo.create({ role, resource, actions }));
    }
    return defaults;
  }

  // Seed default permissions (idempotent)
  async seedDefaults(): Promise<void> {
    for (const [role, resources] of Object.entries(DEFAULT_PERMISSIONS)) {
      for (const [resource, actions] of Object.entries(resources)) {
        const existing = await this.repo.findOne({ where: { role, resource } });
        if (!existing) {
          await this.repo.save(this.repo.create({ role, resource, actions }));
        }
      }
    }
  }
}
