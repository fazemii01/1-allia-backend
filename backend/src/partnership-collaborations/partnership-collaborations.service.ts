import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnershipCollaboration } from './entities/partnership-collaboration.entity';
import { CreatePartnershipCollaborationDto } from './dto/create-partnership-collaboration.dto';

@Injectable()
export class PartnershipCollaborationsService {
  constructor(
    @InjectRepository(PartnershipCollaboration)
    private readonly repo: Repository<PartnershipCollaboration>,
  ) {}

  async findAllActive(): Promise<PartnershipCollaboration[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<PartnershipCollaboration[]> {
    return this.repo.find({ order: { sort_order: 'ASC', id: 'DESC' } });
  }

  async findOne(id: number): Promise<PartnershipCollaboration> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Collaboration ID ${id} tidak ditemukan`);
    return item;
  }

  async create(dto: CreatePartnershipCollaborationDto): Promise<PartnershipCollaboration> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<CreatePartnershipCollaborationDto>): Promise<PartnershipCollaboration> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
