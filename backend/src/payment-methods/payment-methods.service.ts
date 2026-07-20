import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

const DEFAULT_PAYMENT_METHODS = [
  {
    bank_name: 'Bank Central Asia (BCA)',
    account_number: '829-0182-991',
    account_name: 'Klinik Allia Kids',
    instructions: 'Silakan transfer nominal sesuai total tagihan invoice. Cantumkan nomor invoice pada berita transfer.',
    icon_url: '/assets/img/bca.png',
    is_active: true,
    sort_order: 1,
  },
  {
    bank_name: 'Bank Mandiri',
    account_number: '142-00-1928-881',
    account_name: 'Klinik Allia Kids',
    instructions: 'Silakan transfer ke rekening Mandiri Klinik Allia Kids.',
    icon_url: '/assets/img/mandiri.png',
    is_active: true,
    sort_order: 2,
  },
  {
    bank_name: 'QRIS Allia Kids',
    account_number: 'ID1029384756',
    account_name: 'Klinik Allia Kids',
    instructions: 'Pindai kode QRIS menggunakan aplikasi E-Wallet atau m-Banking pilihan Anda.',
    icon_url: '/assets/img/qris.png',
    is_active: true,
    sort_order: 3,
  },
];

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,
  ) {}

  async findAll(activeOnly = false): Promise<PaymentMethod[]> {
    const count = await this.repo.count();
    if (count === 0) {
      await this.seedDefaults();
    }

    const query = this.repo
      .createQueryBuilder('pm')
      .orderBy('pm.sort_order', 'ASC')
      .addOrderBy('pm.id', 'ASC');

    if (activeOnly) {
      query.where('pm.is_active = true');
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Metode pembayaran #${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: number, dto: Partial<CreatePaymentMethodDto>): Promise<PaymentMethod> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { message: `Metode pembayaran #${id} berhasil dihapus` };
  }

  private async seedDefaults() {
    for (const def of DEFAULT_PAYMENT_METHODS) {
      const item = this.repo.create(def);
      await this.repo.save(item);
    }
  }
}
