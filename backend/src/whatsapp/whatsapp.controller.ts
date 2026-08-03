import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Logger,
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

  @Post('templates')
  createTemplate(
    @Body() payload: { id?: string; name: string; body: string; trigger_event?: string | null; auto_send?: boolean; is_active?: boolean },
  ) {
    return this.whatsappService.createTemplate(payload);
  }

  @Put('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() payload: { body: string; trigger_event?: string | null; auto_send?: boolean; is_active?: boolean; name?: string },
  ) {
    return this.whatsappService.updateTemplate(id, payload.body, payload);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.whatsappService.deleteTemplate(id);
  }

  @Post('send')
  send(@Body() payload: any) {
    return this.whatsappService.sendAndLog({
      patient_id: payload.patient_id,
      recipient: payload.recipient || payload.phone || payload.to,
      patient_name: payload.patient_name || payload.name,
      type: payload.type ?? 'manual',
      body: payload.body || payload.message || payload.message_body,
    });
  }

  @Get('auto-replies')
  getAutoReplies() {
    return this.whatsappService.findAllAutoReplies();
  }

  @Post('auto-replies')
  createAutoReply(@Body() payload: { keyword: string; reply_body: string; match_type?: string; is_active?: boolean }) {
    return this.whatsappService.createAutoReply(payload);
  }

  @Put('auto-replies/:id')
  updateAutoReply(@Param('id', ParseIntPipe) id: number, @Body() payload: any) {
    return this.whatsappService.updateAutoReply(id, payload);
  }

  @Delete('auto-replies/:id')
  deleteAutoReply(@Param('id', ParseIntPipe) id: number) {
    return this.whatsappService.deleteAutoReply(id);
  }
}

@Controller('whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    const event: string = payload?.event || '';
    const data: any = payload?.data || {};

    try {
      switch (event) {
        case 'messages.received':
        case 'messages.upsert': {
          const msg = Array.isArray(data?.messages) ? data.messages[0] : data?.messages;
          if (!msg || msg?.key?.fromMe) break;
          const remoteJid: string = msg?.key?.remoteJid || '';
          if (remoteJid.endsWith('@g.us') || remoteJid.includes('broadcast')) break;
          const from = remoteJid.replace(/@.*$/, '');
          const text: string =
            msg?.message?.conversation ||
            msg?.message?.extendedTextMessage?.text ||
            msg?.messageBody ||
            '';
          if (from && text) {
            await this.whatsappService.handleInbound(from, text);
          }
          break;
        }
        case 'messages.update':
        case 'message-receipt.update': {
          // Delivery/read receipts — could update log status by msgId in future.
          this.logger.debug(`Receipt event: ${event}`);
          break;
        }
        case 'session.status': {
          this.logger.log(`WA session status: ${JSON.stringify(data)}`);
          break;
        }
        default:
          break;
      }
    } catch (err: any) {
      this.logger.error(`Webhook handling error (${event}): ${err?.message}`);
    }

    return { ok: true };
  }
}
