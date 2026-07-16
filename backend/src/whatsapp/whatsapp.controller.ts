import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('logs')
  getLogs(@Query('patient_id') patientId?: string) {
    return this.whatsappService.findAllLogs(patientId ? parseInt(patientId) : undefined);
  }

  @Get('templates')
  getTemplates() {
    return this.whatsappService.findAllTemplates();
  }

  @Put('templates/:id')
  updateTemplate(@Param('id') id: string, @Body('body') body: string) {
    return this.whatsappService.updateTemplate(id, body);
  }

  @Post('send')
  send(@Body() payload: any) {
    // Log the send attempt - actual WA API call would go here
    return this.whatsappService.saveLog({
      patient_id: payload.patient_id,
      recipient: payload.recipient,
      patient_name: payload.patient_name,
      type: payload.type ?? 'manual',
      body: payload.body,
      status: 'sent',
    });
  }
}
