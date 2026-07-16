import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partnership } from './entities/partnership.entity';
import { CreatePartnershipDto } from './dto/create-partnership.dto';

@Injectable()
export class PartnershipsService {
  constructor(
    @InjectRepository(Partnership)
    private readonly partnershipRepo: Repository<Partnership>,
  ) {}

  async findAllActive(): Promise<Partnership[]> {
    return this.partnershipRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<Partnership[]> {
    return this.partnershipRepo.find({
      order: { sort_order: 'ASC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Partnership> {
    const partnership = await this.partnershipRepo.findOne({ where: { id } });
    if (!partnership) {
      throw new NotFoundException(`Partnership dengan ID ${id} tidak ditemukan`);
    }
    return partnership;
  }

  async create(dto: CreatePartnershipDto): Promise<Partnership> {
    const partnership = this.partnershipRepo.create(dto);
    return this.partnershipRepo.save(partnership);
  }

  async update(id: number, dto: Partial<CreatePartnershipDto>): Promise<Partnership> {
    const partnership = await this.findOne(id);
    Object.assign(partnership, dto);
    return this.partnershipRepo.save(partnership);
  }

  async remove(id: number): Promise<void> {
    const partnership = await this.findOne(id);
    await this.partnershipRepo.remove(partnership);
  }
}
