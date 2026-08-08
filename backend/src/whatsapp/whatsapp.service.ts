import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaLog } from './entities/wa-log.entity';
import { WaTemplate } from './entities/wa-template.entity';
import { WaAutoReply } from './entities/wa-auto-reply.entity';
import { WaSenderService } from './wasender.service';

export interface SaveLogDto {
  patient_id?: number;
  recipient: string;
  patient_name?: string;
  type: string;
  body: string;
  status?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectRepository(WaLog)
    private readonly logRepo: Repository<WaLog>,
    @InjectRepository(WaTemplate)
    private readonly templateRepo: Repository<WaTemplate>,
    @InjectRepository(WaAutoReply)
    private readonly autoReplyRepo: Repository<WaAutoReply>,
    private readonly wasender: WaSenderService,
  ) {}

  findAllLogs(patientId?: number): Promise<WaLog[]> {
    const query = this.logRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.patient', 'patient')
      .orderBy('log.created_at', 'DESC');
    if (patientId) query.where('log.patient_id = :patientId', { patientId });
    return query.getMany();
  }

  saveLog(dto: SaveLogDto): Promise<WaLog> {
    const log = this.logRepo.create({ ...dto, status: dto.status ?? 'sent' });
    return this.logRepo.save(log);
  }

  async sendAndLog(dto: SaveLogDto): Promise<{ log: WaLog; sent: boolean; error?: string }> {
    const result = await this.wasender.sendMessage(dto.recipient, dto.body);
    const log = await this.saveLog({
      ...dto,
      status: result.ok ? 'sent' : 'failed',
    });
    return { log, sent: result.ok, error: result.error };
  }

  // ── Templates ──────────────────────────────────────────────────────

  findAllTemplates(): Promise<WaTemplate[]> {
    return this.templateRepo.find({ order: { id: 'ASC' } });
  }

  createTemplate(data: Partial<WaTemplate>): Promise<WaTemplate> {
    const id = data.id || (data.name ? data.name.toLowerCase().replace(/\s+/g, '_') : `template_${Date.now()}`);
    const tpl = this.templateRepo.create({
      id,
      name: data.name || id,
      body: data.body || '',
      trigger_event: data.trigger_event || null,
      auto_send: data.auto_send ?? false,
      is_active: data.is_active ?? true,
    });
    return this.templateRepo.save(tpl);
  }

  async updateTemplate(
    id: string,
    body: string,
    extras?: { trigger_event?: string | null; auto_send?: boolean; is_active?: boolean; name?: string },
  ): Promise<WaTemplate> {
    let tpl = await this.templateRepo.findOne({ where: { id } });
    if (!tpl) {
      // Upsert: create template if ID does not exist
      tpl = this.templateRepo.create({ id, name: extras?.name || id, body });
    }
    tpl.body = body;
    if (extras?.name !== undefined) tpl.name = extras.name;
    if (extras?.trigger_event !== undefined) tpl.trigger_event = extras.trigger_event;
    if (extras?.auto_send !== undefined) tpl.auto_send = extras.auto_send;
    if (extras?.is_active !== undefined) tpl.is_active = extras.is_active;
    return this.templateRepo.save(tpl);
  }

  async deleteTemplate(id: string): Promise<void> {
    const tpl = await this.templateRepo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException(`Template "${id}" not found`);
    await this.templateRepo.remove(tpl);
  }

  renderTemplate(body: string, vars: Record<string, any>): string {
    return body.replace(/\{(\w+)\}/g, (_, key) => {
      const val = vars[key];
      return val === undefined || val === null ? '' : String(val);
    });
  }

  private readonly defaultTemplates: Record<string, string> = {
    apply_created:
      'Halo {nama_ortu} 👋\n\nTerima kasih telah mendaftar di *Allia Kids* untuk Ananda {nama_anak}!\n\nData Pendaftaran:\n• Anak: {nama_anak} ({usia} tahun)\n• Layanan: {jenis_terapi}\n• Tgl. Pendaftaran: {tanggal}\n\nTim kami akan segera menghubungi Anda untuk konfirmasi jadwal sesi pertama.\n\nSalam hangat,\n*Tim Allia Kids* 🌟',
    invoice_created:
      'Halo {nama_ortu} 👋\n\nTagihan invoice #{invoice_number} sebesar Rp {total_amount} untuk Ananda {nama_anak} ({layanan}) telah diterbitkan.\n\nLihat & bayar invoice di sini:\n{link_invoice}\n\nJatuh tempo: {due_date}. Terima kasih!',
    session_reminder:
      'Halo {nama_ortu} 👋\n\nPengingat jadwal sesi terapi Ananda {nama_anak} ({jenis_terapi}) pada {tanggal_sesi} pukul {jam_sesi} bersama Terapis {nama_terapis}.\n\nMohon hadir 10 menit sebelum sesi dimulai. Terima kasih!',
    payment_received:
      'Halo {nama_ortu} 👋\n\nPembayaran tagihan invoice #{invoice_number} untuk Ananda {nama_anak} sebesar Rp {total_amount} telah kami terima dan diverifikasi. Terima kasih!',
  };

  async sendByTrigger(
    triggerEvent: string,
    recipient: string,
    vars: Record<string, any>,
    meta?: { patient_id?: number; patient_name?: string },
  ): Promise<{ sent: boolean; template_id?: string; error?: string }> {
    const tpl = await this.templateRepo.findOne({
      where: { trigger_event: triggerEvent, is_active: true },
    });

    let templateBody = tpl?.body;
    if (!templateBody && this.defaultTemplates[triggerEvent]) {
      templateBody = this.defaultTemplates[triggerEvent];
    }

    if (!templateBody) return { sent: false, error: `No template found for trigger: ${triggerEvent}` };

    const body = this.renderTemplate(templateBody, vars);
    const result = await this.sendAndLog({
      patient_id: meta?.patient_id,
      recipient,
      patient_name: meta?.patient_name,
      type: triggerEvent,
      body,
    });
    return { sent: result.sent, template_id: tpl?.id, error: result.error };
  }

  // ── Auto-reply rules ───────────────────────────────────────────────

  findAllAutoReplies(): Promise<WaAutoReply[]> {
    return this.autoReplyRepo.find({ order: { id: 'ASC' } });
  }

  createAutoReply(data: Partial<WaAutoReply>): Promise<WaAutoReply> {
    return this.autoReplyRepo.save(this.autoReplyRepo.create(data));
  }

  async updateAutoReply(id: number, data: Partial<WaAutoReply>): Promise<WaAutoReply> {
    const rule = await this.autoReplyRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Auto-reply #${id} not found`);
    Object.assign(rule, data);
    return this.autoReplyRepo.save(rule);
  }

  async deleteAutoReply(id: number): Promise<void> {
    const rule = await this.autoReplyRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Auto-reply #${id} not found`);
    await this.autoReplyRepo.remove(rule);
  }

  // ── Inbound handling ───────────────────────────────────────────────

  async handleInbound(from: string, text: string): Promise<void> {
    const recipient = this.wasender.normalizeMsisdn(from);
    if (!recipient) {
      this.logger.warn(`Skipping handleInbound for invalid recipient (from: "${from}")`);
      return;
    }

    await this.saveLog({
      recipient,
      type: 'inbound',
      body: text,
      status: 'received',
    });

    const rules = await this.autoReplyRepo.find({ where: { is_active: true } });
    const normalized = (text || '').trim().toLowerCase();
    if (!normalized) return;

    // Rule matcher logic:
    // Supports comma-separated keywords (e.g., "halo, permisi, min")
    const matched = rules.find((r) => {
      if (r.keyword === '*') return false; // fallback handled later
      const keywords = r.keyword.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
      if (r.match_type === 'exact') {
        return keywords.some((kw) => normalized === kw);
      } else {
        // 'contains' mode: matches if incoming message contains keyword OR keyword contains incoming message
        return keywords.some((kw) => normalized.includes(kw) || kw.includes(normalized));
      }
    }) || rules.find((r) => r.keyword === '*');

    if (!matched) return;

    this.logger.log(`Matched auto-reply rule #${matched.id} (keyword: "${matched.keyword}") for recipient ${recipient}`);
    await this.sendAndLog({
      recipient,
      type: 'auto_reply',
      body: matched.reply_body,
    });
  }
}
