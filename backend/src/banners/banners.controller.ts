import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Public endpoint for landing page slider
  @Get('banners')
  findAllActive() {
    return this.bannersService.findAllActive();
  }

  // Admin administrative list
  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  // Admin banner creation
  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreateBannerDto, @Request() req: any) {
    const banner = await this.bannersService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Banner',
      modelId: String(banner.id),
      description: `Menambahkan banner baru dengan ID: ${banner.id}`,
      properties: { image_url: banner.image_url, href: banner.href },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return banner;
  }

  // Admin upload file to MinIO
  @Post('admin/banners/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadBanner(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `banner-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('banners', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload',
      description: `Uploaded Banner file: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  // Admin update banner
  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateBannerDto>,
    @Request() req: any,
  ) {
    const banner = await this.bannersService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Banner',
      modelId: String(banner.id),
      description: `Mengubah banner ID: ${banner.id}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return banner;
  }

  // Admin delete banner
  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.bannersService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Banner',
      modelId: String(id),
      description: `Menghapus banner ID: ${id}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
