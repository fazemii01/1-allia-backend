import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { EdukasiService } from './edukasi.service';
import { CreateEdukasiDto } from './dto/create-edukasi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('edukasi')
export class EdukasiPublicController {
  constructor(private readonly edukasiService: EdukasiService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.edukasiService.findAll(category, true);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.edukasiService.findBySlug(slug, true);
  }
}

@Controller('admin/edukasi')
@UseGuards(JwtAuthGuard)
export class EdukasiAdminController {
  constructor(
    private readonly edukasiService: EdukasiService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.edukasiService.findAll(category, false);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.edukasiService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateEdukasiDto, @Request() req: any) {
    const content = await this.edukasiService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Edukasi',
      modelId: String(content.id),
      description: `Created Edukasi: ${content.title} (${content.category})`,
      properties: { new: content },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return content;
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  }))
  async uploadImage(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `edukasi-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('edukasi', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload',
      description: `Uploaded Edukasi asset file: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateEdukasiDto>,
    @Request() req: any,
  ) {
    const original = await this.edukasiService.findOne(id);
    const updated = await this.edukasiService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Edukasi',
      modelId: String(id),
      description: `Updated Edukasi: ${updated.title}`,
      properties: { old: original, new: dto },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.edukasiService.findOne(id);
    const result = await this.edukasiService.publish(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Edukasi',
      modelId: String(id),
      description: `Published/Toggled Publish Status for Edukasi: ${original.title}`,
      properties: { old: original },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.edukasiService.findOne(id);
    const result = await this.edukasiService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Edukasi',
      modelId: String(id),
      description: `Deleted Edukasi: ${original.title}`,
      properties: { old: original },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
