import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('admin/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('therapist_id') therapist_id?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll({
      date,
      therapist_id: therapist_id ? parseInt(therapist_id, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    const appointment = await this.appointmentsService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Appointment',
      modelId: String(appointment.id),
      description: `Created Appointment for Patient ID: ${appointment.patient_id}`,
      properties: { new: appointment },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return appointment;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateAppointmentDto>,
    @Request() req: any,
  ) {
    const original = await this.appointmentsService.findOne(id);
    const updated = await this.appointmentsService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Appointment',
      modelId: String(id),
      description: `Updated Appointment ID: ${id}`,
      properties: { old: original, new: dto },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.appointmentsService.findOne(id);
    const result = await this.appointmentsService.cancel(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Appointment',
      modelId: String(id),
      description: `Cancelled Appointment ID: ${id}`,
      properties: { old: original, new: { status: 'dibatalkan' } },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
