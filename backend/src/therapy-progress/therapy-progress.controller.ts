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
  Request,
} from '@nestjs/common';
import { TherapyProgressService } from './therapy-progress.service';
import { CreateTherapyProgressLogDto } from './dto/create-therapy-progress-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/therapy-progress')
@UseGuards(JwtAuthGuard)
export class TherapyProgressAdminController {
  constructor(private readonly progressService: TherapyProgressService) {}

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.progressService.findByPatient(patientId);
  }

  @Post()
  create(@Body() dto: CreateTherapyProgressLogDto) {
    return this.progressService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTherapyProgressLogDto>,
  ) {
    return this.progressService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.progressService.remove(id);
  }
}

@Controller('therapy-progress/me')
@UseGuards(JwtAuthGuard)
export class TherapyProgressClientController {
  constructor(private readonly progressService: TherapyProgressService) {}

  @Get()
  async getMyProgress(@Request() req: any) {
    const whatsapp = req.user.whatsapp;
    const email = req.user.email || null;
    return this.progressService.findMyProgress(whatsapp, email);
  }
}
