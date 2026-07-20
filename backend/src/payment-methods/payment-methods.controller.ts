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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MinioService } from '../shared/minio.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller()
export class PaymentMethodsController {
  constructor(
    private readonly service: PaymentMethodsService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('payment-methods')
  findAllActive() {
    return this.service.findAll(true);
  }

  @Get('admin/payment-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findAllAdmin() {
    return this.service.findAll(false);
  }

  @Get('admin/payment-methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/payment-methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async create(@Body() dto: CreatePaymentMethodDto, @Request() req: any) {
    const item = await this.service.create(dto);
    await this.activityLogsService.log({
      userId: req.user?.userId,
      action: 'create',
      modelType: 'PaymentMethod',
      modelId: String(item.id),
      description: `Menambahkan metode pembayaran baru: ${item.bank_name}`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  @Post('admin/payment-methods/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadIcon(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `pm-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('payment-methods', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user?.userId,
      action: 'upload',
      description: `Uploaded Payment Method Icon: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }

  @Patch('admin/payment-methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePaymentMethodDto>,
    @Request() req: any,
  ) {
    const item = await this.service.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user?.userId,
      action: 'update',
      modelType: 'PaymentMethod',
      modelId: String(item.id),
      description: `Mengubah metode pembayaran ID: ${item.id} (${item.bank_name})`,
      properties: dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return item;
  }

  @Delete('admin/payment-methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const item = await this.service.findOne(id);
    await this.service.remove(id);
    await this.activityLogsService.log({
      userId: req.user?.userId,
      action: 'delete',
      modelType: 'PaymentMethod',
      modelId: String(id),
      description: `Menghapus metode pembayaran: ${item.bank_name}`,
      properties: { bank_name: item.bank_name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
