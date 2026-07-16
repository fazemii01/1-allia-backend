import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict a route to specific roles.
 * Usage: @Roles('admin') or @Roles('admin', 'staff')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
