import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { MinioService } from '../shared/minio.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly minioService: MinioService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Request() req: any) {
    const result = await this.authService.login(dto);
    if (result && result.user) {
      await this.activityLogsService.log({
        userId: result.user.id ?? null,
        action: 'login',
        description: `User ${result.user.name} logged in successfully`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return this.authService.findById(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() body: any) {
    const user = await this.authService.updateProfile(req.user.userId, body);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update_profile',
      modelType: 'User',
      modelId: String(req.user.userId),
      description: `User ${user.name} diperbarui profilnya`,
      properties: body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return user;
  }

  @Post('profile/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadProfilePhoto(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('File tidak boleh kosong!');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `avatar-${uniqueSuffix}${extname(file.originalname)}`;
    const url = await this.minioService.uploadFile('avatars', filename, file.buffer, file.mimetype);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'upload_avatar',
      description: `Uploaded profile avatar: ${file.originalname}`,
      properties: { url, size: file.size, mime: file.mimetype },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { url };
  }
}
