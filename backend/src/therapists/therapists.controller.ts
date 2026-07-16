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
import { TherapistsService } from './therapists.service';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('admin/therapists')
@UseGuards(JwtAuthGuard)
export class TherapistsController {
  constructor(
    private readonly therapistsService: TherapistsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get()
  findAll() {
    return this.therapistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.therapistsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateTherapistDto, @Request() req: any) {
    const therapist = await this.therapistsService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Therapist',
      modelId: String(therapist.id),
      description: `Created Therapist: ${therapist.name}`,
      properties: { new: therapist },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return therapist;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTherapistDto>,
    @Request() req: any,
  ) {
    const original = await this.therapistsService.findOne(id);
    const updated = await this.therapistsService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Therapist',
      modelId: String(id),
      description: `Updated Therapist: ${updated.name}`,
      properties: { old: original, new: dto },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.therapistsService.findOne(id);
    const result = await this.therapistsService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Therapist',
      modelId: String(id),
      description: `Deleted Therapist: ${original.name}`,
      properties: { old: original },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
