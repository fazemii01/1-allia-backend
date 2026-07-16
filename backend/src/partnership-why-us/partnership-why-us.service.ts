import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnershipWhyUs } from './entities/partnership-why-us.entity';
import { CreatePartnershipWhyUsDto } from './dto/create-partnership-why-us.dto';

@Injectable()
export class PartnershipWhyUsService {
  constructor(
    @InjectRepository(PartnershipWhyUs)
    private readonly repo: Repository<PartnershipWhyUs>,
  ) {}

  async findAllActive(): Promise<PartnershipWhyUs[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<PartnershipWhyUs[]> {
    return this.repo.find({ order: { sort_order: 'ASC', id: 'DESC' } });
  }

  async findOne(id: number): Promise<PartnershipWhyUs> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`WhyUs item ID ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreatePartnershipWhyUsDto): Promise<PartnershipWhyUs> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<CreatePartnershipWhyUsDto>): Promise<PartnershipWhyUs> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
