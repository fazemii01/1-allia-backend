import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments/me')
@UseGuards(JwtAuthGuard)
export class AppointmentsClientController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async getMyAppointments(@Request() req: any) {
    const whatsapp = req.user.whatsapp;
    const email = req.user.email || null;
    return this.appointmentsService.findMyAppointments(whatsapp, email);
  }
}
