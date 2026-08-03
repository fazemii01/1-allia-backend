import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WaSendResult {
  ok: boolean;
  msgId?: string;
  error?: string;
}

@Injectable()
export class WaSenderService {
  private readonly logger = new Logger(WaSenderService.name);
  private readonly baseUrl = 'https://www.wasenderapi.com/api';

  constructor(private readonly config: ConfigService) {}

  normalizeMsisdn(phone: string): string {
    let digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';

    // Filter out WhatsApp LIDs (e.g., 15+ digits starting with '19', like 190829859745794)
    if (digits.length >= 15 && digits.startsWith('19')) {
      this.logger.warn(`Skipping invalid phone number (detected WhatsApp LID: "${digits}")`);
      return '';
    }

    if (digits.startsWith('620')) {
      digits = `62${digits.slice(3)}`;
    } else if (digits.startsWith('0')) {
      digits = `62${digits.slice(1)}`;
    }
    return digits;
  }

  isConfigured(): boolean {
    return !!this.config.get<string>('WASENDER_API_KEY');
  }

  async sendMessage(to: string, text: string): Promise<WaSendResult> {
    const apiKey = this.config.get<string>('WASENDER_API_KEY');
    const recipient = this.normalizeMsisdn(to);
    if (!apiKey) {
      this.logger.warn('WASENDER_API_KEY not set — skipping real send');
      return { ok: false, error: 'WASENDER_API_KEY not configured' };
    }
    if (!recipient) {
      return { ok: false, error: 'Invalid recipient number' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/send-message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: recipient, text }),
      });
      const data: any = await res.json().catch(() => null);
      if (!res.ok) {
        const errMsg = data?.message || `HTTP ${res.status}`;
        this.logger.error(`WaSender send failed: ${errMsg}`);
        return { ok: false, error: errMsg };
      }
      const msgId = data?.data?.msgId ?? data?.msgId ?? data?.id;
      return { ok: true, msgId: msgId ? String(msgId) : undefined };
    } catch (err: any) {
      this.logger.error(`WaSender send error: ${err?.message}`);
      return { ok: false, error: err?.message || 'Network error' };
    }
  }
}
