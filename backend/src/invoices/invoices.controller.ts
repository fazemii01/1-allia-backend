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
  Request,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Controller('admin/invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.invoicesService.findAll(status);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.invoicesService.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateInvoiceDto, @Request() req: any) {
    const invoice = await this.invoicesService.create(dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Invoice',
      modelId: String(invoice.id),
      description: `Created Invoice: ${invoice.invoice_number} for Patient ID: ${invoice.patient_id}`,
      properties: { new: invoice },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    try {
      const full = await this.invoicesService.findOne(invoice.id);
      const patient = full.patient;
      const phone = patient?.no_telepon;
      if (phone) {
        const firstItem = full.items?.[0];
        await this.whatsappService.sendByTrigger('invoice_created', phone, {
          nama_ortu: patient?.nama_ibu || patient?.nama_ayah || 'Bapak/Ibu',
          nama_anak: patient?.nama_lengkap || '',
          invoice_number: full.invoice_number,
          layanan: firstItem?.description || '',
          total_amount: Number(full.total_amount).toLocaleString('id-ID'),
          due_date: full.due_date,
        }, { patient_id: full.patient_id, patient_name: patient?.nama_lengkap });
      }
    } catch (e) {
      console.warn('WA invoice_created notification skipped:', e);
    }

    return invoice;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateInvoiceDto>,
    @Request() req: any,
  ) {
    const original = await this.invoicesService.findOne(id);
    const updated = await this.invoicesService.update(id, dto);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Invoice',
      modelId: String(id),
      description: `Updated Invoice ID: ${id}`,
      properties: { old: original, new: dto },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return updated;
  }

  @Patch(':id/mark-paid')
  async markPaid(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.invoicesService.findOne(id);
    const result = await this.invoicesService.markPaid(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'update',
      modelType: 'Invoice',
      modelId: String(id),
      description: `Marked Invoice: ${original.invoice_number} as Lunas (Paid)`,
      properties: { old: original, new: { status: 'sudah_bayar' } },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    try {
      const full = await this.invoicesService.findOne(id);
      const patient = full.patient;
      const phone = patient?.no_telepon;
      if (phone) {
        await this.whatsappService.sendByTrigger('payment_received', phone, {
          nama_ortu: patient?.nama_ibu || patient?.nama_ayah || 'Bapak/Ibu',
          nama_anak: patient?.nama_lengkap || '',
          invoice_number: full.invoice_number,
          total_amount: Number(full.total_amount).toLocaleString('id-ID'),
        }, { patient_id: full.patient_id, patient_name: patient?.nama_lengkap });
      }
    } catch (e) {
      console.warn('WA payment_received notification skipped:', e);
    }

    return result;
  }

  @Post(':id/create-pelunasan')
  async createPelunasan(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const pelunasan = await this.invoicesService.createPelunasanInvoice(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'create',
      modelType: 'Invoice',
      modelId: String(pelunasan.id),
      description: `Created Pelunasan 50% Invoice: ${pelunasan.invoice_number} from DP Invoice ID: ${id}`,
      properties: { parent_invoice_id: id, new: pelunasan },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return pelunasan;
  }

  @Post(':id/send-whatsapp')
  async sendWhatsApp(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const full = await this.invoicesService.findOne(id);
    const patient = full.patient;
    const phone = patient?.no_telepon;
    let waResult: any = null;

    if (phone) {
      const firstItem = full.items?.[0];
      waResult = await this.whatsappService.sendByTrigger('invoice_created', phone, {
        nama_ortu: patient?.nama_ibu || patient?.nama_ayah || 'Bapak/Ibu',
        nama_anak: patient?.nama_lengkap || '',
        invoice_number: full.invoice_number,
        layanan: firstItem?.description || '',
        total_amount: Number(full.total_amount).toLocaleString('id-ID'),
        due_date: full.due_date,
      }, { patient_id: full.patient_id, patient_name: patient?.nama_lengkap });
    }

    const result = await this.invoicesService.recordWaSent(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'whatsapp',
      modelType: 'Invoice',
      modelId: String(id),
      description: `Sent Invoice WhatsApp Notification for Invoice ID: ${id} (${full.invoice_number})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { invoice: result, whatsapp: waResult };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const original = await this.invoicesService.findOne(id);
    const result = await this.invoicesService.remove(id);
    await this.activityLogsService.log({
      userId: req.user.userId,
      action: 'delete',
      modelType: 'Invoice',
      modelId: String(id),
      description: `Deleted Invoice: ${original.invoice_number}`,
      properties: { old: original },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}

@Controller('public/invoices')
export class PublicInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':code')
  findPublicByCode(@Param('code') code: string) {
    return this.invoicesService.findPublicByCode(code);
  }
}
