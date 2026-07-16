import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, Request,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { PartnershipMomentsService } from './partnership-moments.service';
import { CreatePartnershipMomentDto } from './dto/create-partnership-moment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class PartnershipMomentsController {
  constructor(
    private readonly service: PartnershipMomentsService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Public
  @Get('partnership-moments')
  findAllActive() {
    return this.service.findAllActive();
  }

  // Admin list
  @Get('admin/partnership-moments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  // Admin upload image
  @Post('admin/partnership-moments/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadImage(@UploadedFile() file: any, @Request() req: any) {
    if (!file) throw new BadRequestException('File tidak boleh kosong!');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `moment-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('partnership-moments', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload',
      description: `Upload foto momen kemitraan: ${file.originalname}`,
      properties: { url, size: file.size },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  // Admin create
  @Post('admin/partnership-moments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreatePartnershipMomentDto, @Request() req: any) {
    const item = await this.service.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'PartnershipMoment',
      modelId: String(item.id),
      description: `Menambahkan foto momen: ${item.title}`,
      properties: { title: item.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  // Admin update
  @Patch('admin/partnership-moments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePartnershipMomentDto>,
    @Request() req: any,
  ) {
    const item = await this.service.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'PartnershipMoment',
      modelId: String(item.id),
      description: `Mengubah foto momen ID: ${item.id}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  // Admin delete
  @Delete('admin/partnership-moments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const item = await this.service.findOne(id);
    await this.service.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'PartnershipMoment',
      modelId: String(id),
      description: `Menghapus foto momen: ${item.title}`,
      properties: { title: item.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
