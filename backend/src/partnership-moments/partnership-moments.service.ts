import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnershipMoment } from './entities/partnership-moment.entity';
import { CreatePartnershipMomentDto } from './dto/create-partnership-moment.dto';

@Injectable()
export class PartnershipMomentsService {
  constructor(
    @InjectRepository(PartnershipMoment)
    private readonly repo: Repository<PartnershipMoment>,
  ) {}

  async findAllActive(): Promise<PartnershipMoment[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<PartnershipMoment[]> {
    return this.repo.find({ order: { sort_order: 'ASC', id: 'DESC' } });
  }

  async findOne(id: number): Promise<PartnershipMoment> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Moment ID ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreatePartnershipMomentDto): Promise<PartnershipMoment> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<CreatePartnershipMomentDto>): Promise<PartnershipMoment> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
