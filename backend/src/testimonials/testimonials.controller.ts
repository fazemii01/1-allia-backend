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
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('testimonials')
  findAllActive() {
    return this.testimonialsService.findAllActive();
  }

  @Get('admin/testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.testimonialsService.findAllAdmin();
  }

  @Post('admin/testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreateTestimonialDto, @Request() req: any) {
    const testimonial = await this.testimonialsService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Testimonial',
      modelId: String(testimonial.id),
      description: `Menambahkan testimoni baru dari: ${testimonial.name}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return testimonial;
  }

  @Post('admin/testimonials/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadAvatar(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `avatar-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('testimonials', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload',
      description: `Uploaded Testimonial Avatar: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  @Patch('admin/testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTestimonialDto>,
    @Request() req: any,
  ) {
    const testimonial = await this.testimonialsService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Testimonial',
      modelId: String(testimonial.id),
      description: `Mengubah testimoni ID: ${testimonial.id}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return testimonial;
  }

  @Delete('admin/testimonials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const testimonial = await this.testimonialsService.findOne(id);
    await this.testimonialsService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Testimonial',
      modelId: String(id),
      description: `Menghapus testimoni dari: ${testimonial.name}`,
      properties: { name: testimonial.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
