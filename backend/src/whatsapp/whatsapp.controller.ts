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
  Request,
  Logger,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Controller('admin/whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('logs')
  getLogs(@Query('patient_id') patientId?: string) {
    return this.whatsappService.findAllLogs(patientId ? parseInt(patientId) : undefined);
  }

  @Get('templates')
  getTemplates() {
    return this.whatsappService.findAllTemplates();
  }

  @Post('templates')
  async createTemplate(
    @Body() payload: { id?: string; name: string; body: string; trigger_event?: string | null; auto_send?: boolean; is_active?: boolean },
    @Request() req: any,
  ) {
    const tpl = await this.whatsappService.createTemplate(payload);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'create',
      modelType: 'WaTemplate',
      modelId: tpl.id,
      description: `Created WA Template: ${tpl.name || tpl.id}`,
      properties: { new: tpl },
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return tpl;
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() payload: { body: string; trigger_event?: string | null; auto_send?: boolean; is_active?: boolean; name?: string },
    @Request() req: any,
  ) {
    const tpl = await this.whatsappService.updateTemplate(id, payload.body, payload);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'update',
      modelType: 'WaTemplate',
      modelId: id,
      description: `Updated WA Template: ${tpl.name || id}`,
      properties: { new: payload },
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return tpl;
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @Request() req: any) {
    const res = await this.whatsappService.deleteTemplate(id);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'delete',
      modelType: 'WaTemplate',
      modelId: id,
      description: `Deleted WA Template: ${id}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return res;
  }

  @Post('send')
  async send(@Body() payload: any, @Request() req: any) {
    const result = await this.whatsappService.sendAndLog({
      patient_id: payload.patient_id,
      recipient: payload.recipient || payload.phone || payload.to,
      patient_name: payload.patient_name || payload.name,
      type: payload.type ?? 'manual',
      body: payload.body || payload.message || payload.message_body,
    });

    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'whatsapp',
      modelType: 'WaLog',
      modelId: String(result?.log?.id || ''),
      description: `Sent Manual WA Message to ${payload.recipient || payload.phone || payload.to}`,
      properties: { recipient: payload.recipient || payload.phone, type: payload.type ?? 'manual' },
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });

    return result;
  }

  @Get('auto-replies')
  getAutoReplies() {
    return this.whatsappService.findAllAutoReplies();
  }

  @Post('auto-replies')
  async createAutoReply(
    @Body() payload: { keyword: string; reply_body: string; match_type?: string; is_active?: boolean },
    @Request() req: any,
  ) {
    const rule = await this.whatsappService.createAutoReply(payload);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'create',
      modelType: 'WaAutoReply',
      modelId: String(rule.id),
      description: `Created WA Auto-Reply Rule: "${rule.keyword}"`,
      properties: { new: rule },
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return rule;
  }

  @Put('auto-replies/:id')
  async updateAutoReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: any,
    @Request() req: any,
  ) {
    const rule = await this.whatsappService.updateAutoReply(id, payload);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'update',
      modelType: 'WaAutoReply',
      modelId: String(id),
      description: `Updated WA Auto-Reply Rule #${id}: "${rule.keyword}"`,
      properties: { new: payload },
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return rule;
  }

  @Delete('auto-replies/:id')
  async deleteAutoReply(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const res = await this.whatsappService.deleteAutoReply(id);
    await this.activityLogsService.log({
      userId: req?.user?.userId,
      action: 'delete',
      modelType: 'WaAutoReply',
      modelId: String(id),
      description: `Deleted WA Auto-Reply Rule #${id}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
    return res;
  }
}

function extractSenderPhone(payload: any, data: any, msg: any): string {
  const candidates: string[] = [
    payload?.phone,
    payload?.senderPhone,
    payload?.recipient,
    data?.phone,
    data?.senderPhone,
    data?.recipient,
    msg?.key?.remoteJidAlt,
    msg?.senderPn,
    msg?.participantPn,
    msg?.key?.participant,
    msg?.key?.remoteJid,
    msg?.from,
    msg?.sender,
    data?.from,
    payload?.from,
  ].filter(Boolean).map(String);

  // 1. High priority: Check for JID ending with @s.whatsapp.net
  for (const c of candidates) {
    if (c.includes('@s.whatsapp.net')) {
      return c.replace(/@.*$/, '');
    }
  }

  // 2. High priority: Check for standard phone numbers (starts with 628, 08, or +628)
  for (const c of candidates) {
    const digits = c.replace(/\D/g, '');
    if ((digits.startsWith('628') || digits.startsWith('08')) && digits.length >= 10 && digits.length <= 14) {
      return digits;
    }
  }

  // 3. Regex scan over payload JSON string for phone number pattern 628... or 08...
  try {
    const jsonStr = JSON.stringify({ payload, data, msg });
    const match = jsonStr.match(/(?:628|08)\d{8,12}/);
    if (match) return match[0];
  } catch (e) {}

  // 4. Fallback: Return first candidate that is not a LID (@lid) or group (@g.us)
  for (const c of candidates) {
    if (!c.endsWith('@lid') && !c.endsWith('@g.us') && !c.includes('broadcast')) {
      const clean = c.replace(/@.*$/, '');
      if (!clean.startsWith('19') || clean.length < 14) {
        return clean;
      }
    }
  }

  return '';
}

@Controller('whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    this.logger.log(`WA Webhook payload received: ${JSON.stringify(payload)}`);
    const event: string = payload?.event || payload?.type || payload?.action || '';
    const data: any = payload?.data || payload;

    try {
      let from = '';
      let text = '';

      const msg = Array.isArray(data?.messages) ? data.messages[0] : data?.messages || data?.message || data;
      const isFromMe = msg?.key?.fromMe ?? msg?.fromMe ?? payload?.fromMe ?? false;

      if (!isFromMe) {
        from = extractSenderPhone(payload, data, msg);
        text =
          msg?.message?.conversation ||
          msg?.message?.extendedTextMessage?.text ||
          msg?.messageBody ||
          msg?.body ||
          msg?.text ||
          data?.text ||
          payload?.text ||
          '';
      }

      if (from && text) {
        this.logger.log(`Processing inbound WA from ${from}: "${text}"`);
        await this.whatsappService.handleInbound(from, text);
      } else {
        this.logger.log(`Webhook event "${event}" received (no valid non-LID sender or text found).`);
      }
    } catch (err: any) {
      this.logger.error(`Webhook handling error (${event}): ${err?.message}`);
    }

    return { ok: true };
  }
}
