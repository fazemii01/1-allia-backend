import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ResourceActions } from './entities/role-permission.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function requireAdmin(req: any) {
  if (req.user?.role !== 'admin') {
    throw new ForbiddenException('Only admins can manage permissions');
  }
}

@Controller('admin/permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /** GET /api/admin/permissions — all roles & resources (admin only) */
  @Get()
  getAll(@Request() req: any) {
    requireAdmin(req);
    return this.permissionsService.findAll();
  }

  /** GET /api/admin/permissions/:role — permissions for a specific role */
  @Get(':role')
  getByRole(@Request() req: any, @Param('role') role: string) {
    requireAdmin(req);
    return this.permissionsService.findByRole(role);
  }

  /** PUT /api/admin/permissions/:role — bulk update a role's permissions */
  @Put(':role')
  updateRole(
    @Request() req: any,
    @Param('role') role: string,
    @Body() permissions: Record<string, ResourceActions>,
  ) {
    requireAdmin(req);
    if (role === 'admin') {
      throw new ForbiddenException('Cannot modify admin permissions');
    }
    return this.permissionsService.updateRole(role, permissions);
  }

  /** PUT /api/admin/permissions/:role/:resource — update a single resource permission */
  @Put(':role/:resource')
  updateResource(
    @Request() req: any,
    @Param('role') role: string,
    @Param('resource') resource: string,
    @Body() actions: Partial<ResourceActions>,
  ) {
    requireAdmin(req);
    if (role === 'admin') {
      throw new ForbiddenException('Cannot modify admin permissions');
    }
    return this.permissionsService.upsert(role, resource, actions);
  }

  /** POST /api/admin/permissions/:role/reset — reset role to defaults */
  @Post(':role/reset')
  resetToDefault(@Request() req: any, @Param('role') role: string) {
    requireAdmin(req);
    return this.permissionsService.resetToDefault(role);
  }
}

/** Public endpoint — used by the frontend to get current user's permissions */
@Controller('me/permissions')
@UseGuards(JwtAuthGuard)
export class MyPermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  getMyPermissions(@Request() req: any) {
    return this.permissionsService.findByRole(req.user.role);
  }
}
