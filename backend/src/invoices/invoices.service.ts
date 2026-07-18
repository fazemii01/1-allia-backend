import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

function generateInvoiceToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findAll(status?: string): Promise<Invoice[]> {
    const query = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .leftJoinAndSelect('invoice.appointment', 'appointment')
      .orderBy('invoice.created_at', 'DESC');

    if (status) {
      query.andWhere('invoice.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: { patient: true, appointment: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
    return invoice;
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    // Auto-generate invoice number: INV-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.invoiceRepo.count();
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Auto-generate unique 8-char token
    let invoiceToken = generateInvoiceToken();
    let tokenExists = await this.invoiceRepo.findOne({ where: { invoice_token: invoiceToken } });
    while (tokenExists) {
      invoiceToken = generateInvoiceToken();
      tokenExists = await this.invoiceRepo.findOne({ where: { invoice_token: invoiceToken } });
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const invoice = this.invoiceRepo.create({
      ...dto,
      invoice_number: invoiceNumber,
      invoice_token: invoiceToken,
      total_amount: totalAmount,
    });

    return this.invoiceRepo.save(invoice);
  }

  async findByToken(token: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_token: token },
      relations: { patient: true, appointment: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice dengan token ${token} tidak ditemukan`);
    return invoice;
  }

  async markPaid(id: number): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = 'sudah_bayar';
    invoice.paid_at = new Date();
    return this.invoiceRepo.save(invoice);
  }

  async recordWaSent(id: number): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.wa_sent_at = new Date();
    return this.invoiceRepo.save(invoice);
  }

  async update(id: number, dto: Partial<CreateInvoiceDto>): Promise<Invoice> {
    const invoice = await this.findOne(id);
    if (dto.items) {
      invoice.total_amount = dto.items.reduce((sum, item) => sum + item.amount, 0);
    }
    Object.assign(invoice, dto);
    return this.invoiceRepo.save(invoice);
  }

  async remove(id: number): Promise<{ message: string }> {
    const invoice = await this.findOne(id);
    await this.invoiceRepo.remove(invoice);
    return { message: `Invoice #${id} deleted` };
  }

  async findMyInvoices(whatsapp: string, email: string | null): Promise<Invoice[]> {
    const query = this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .leftJoinAndSelect('invoice.appointment', 'appointment')
      .where('(patient.no_telepon = :whatsapp' + (email ? ' OR patient.email_ortu = :email' : '') + ')', {
        whatsapp,
        email,
      })
      .orderBy('invoice.created_at', 'DESC');
    
    return query.getMany();
  }

  async uploadPaymentProof(id: number, filePath: string, whatsapp: string, email: string | null): Promise<Invoice> {
    const invoice = await this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .where('invoice.id = :id', { id })
      .andWhere('(patient.no_telepon = :whatsapp' + (email ? ' OR patient.email_ortu = :email' : '') + ')', {
        whatsapp,
        email,
      })
      .getOne();

    if (!invoice) {
      throw new NotFoundException(`Invoice #${id} tidak ditemukan atau Anda tidak berwenang.`);
    }

    invoice.payment_proof = filePath;
    invoice.status = 'menunggu_verifikasi';
    return this.invoiceRepo.save(invoice);
  }
}
