import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { PartnershipWhyUsService } from './partnership-why-us.service';
import { CreatePartnershipWhyUsDto } from './dto/create-partnership-why-us.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class PartnershipWhyUsController {
  constructor(
    private readonly service: PartnershipWhyUsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Public
  @Get('partnership-why-us')
  findAllActive() {
    return this.service.findAllActive();
  }

  // Admin list
  @Get('admin/partnership-why-us')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  // Admin create
  @Post('admin/partnership-why-us')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreatePartnershipWhyUsDto, @Request() req: any) {
    const item = await this.service.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'PartnershipWhyUs',
      modelId: String(item.id),
      description: `Menambahkan item Mengapa Kami: ${item.title}`,
      properties: { title: item.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  // Admin update
  @Patch('admin/partnership-why-us/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePartnershipWhyUsDto>,
    @Request() req: any,
  ) {
    const item = await this.service.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'PartnershipWhyUs',
      modelId: String(item.id),
      description: `Mengubah item Mengapa Kami ID: ${item.id}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  // Admin delete
  @Delete('admin/partnership-why-us/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const item = await this.service.findOne(id);
    await this.service.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'PartnershipWhyUs',
      modelId: String(id),
      description: `Menghapus item Mengapa Kami: ${item.title}`,
      properties: { title: item.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
