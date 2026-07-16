import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'staff')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findAll(
    @Query('action') action?: string,
    @Query('user_id') userId?: string,
    @Query('search') search?: string,
  ) {
    return this.activityLogsService.findAll({
      action,
      userId: userId ? parseInt(userId, 10) : undefined,
      search,
    });
  }
}
