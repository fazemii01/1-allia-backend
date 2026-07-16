import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('admin/patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('jenis_terapi') jenis_terapi?: string,
    @Query('status') status?: string,
  ) {
    return this.patientsService.findAll({ search, jenis_terapi, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePatientDto>,
    @Request() req: any,
  ) {
    const original = await this.patientsService.findOne(id);
    const updated = await this.patientsService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Patient',
      modelId: String(id),
      description: `Updated Patient: ${updated.nama_lengkap}`,
      properties: { old: original, new: dto },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.patientsService.findOne(id);
    const result = await this.patientsService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Patient',
      modelId: String(id),
      description: `Deleted Patient: ${original.nama_lengkap}`,
      properties: { old: original },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
