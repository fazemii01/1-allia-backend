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
import { PartnershipsService } from './partnerships.service';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class PartnershipsController {
  constructor(
    private readonly partnershipsService: PartnershipsService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // Public list for landing page
  @Get('partnerships')
  findAllActive() {
    return this.partnershipsService.findAllActive();
  }

  // Admin list
  @Get('admin/partnerships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.partnershipsService.findAllAdmin();
  }

  // Admin create partnership
  @Post('admin/partnerships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreatePartnershipDto, @Request() req: any) {
    const partnership = await this.partnershipsService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Partnership',
      modelId: String(partnership.id),
      description: `Menambahkan mitra kolaborasi baru: ${partnership.name}`,
      properties: { name: partnership.name, slug: partnership.slug, logo_url: partnership.logo_url },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return partnership;
  }

  // Admin upload logo to MinIO
  @Post('admin/partnerships/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadLogo(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `partner-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('partnerships', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload',
      description: `Uploaded Partner Logo file: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  // Admin update partnership
  @Patch('admin/partnerships/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePartnershipDto>,
    @Request() req: any,
  ) {
    const partnership = await this.partnershipsService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Partnership',
      modelId: String(partnership.id),
      description: `Mengubah data mitra kolaborasi ID: ${partnership.id}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return partnership;
  }

  // Admin delete partnership
  @Delete('admin/partnerships/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const partnership = await this.partnershipsService.findOne(id);
    await this.partnershipsService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Partnership',
      modelId: String(id),
      description: `Menghapus mitra kolaborasi: ${partnership.name}`,
      properties: { name: partnership.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
