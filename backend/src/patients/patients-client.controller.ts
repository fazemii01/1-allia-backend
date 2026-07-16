import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients/me')
@UseGuards(JwtAuthGuard)
export class PatientsClientController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('active-therapies')
  async getActiveTherapies(@Request() req: any) {
    // req.user has: sub (id), whatsapp, email, role
    const whatsapp = req.user.whatsapp;
    const email = req.user.email || null;
    return this.patientsService.findMyActiveTherapies(whatsapp, email);
  }
}
