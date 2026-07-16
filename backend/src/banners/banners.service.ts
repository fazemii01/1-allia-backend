import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async findAllActive(): Promise<Banner[]> {
    return this.bannerRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findAllAdmin(): Promise<Banner[]> {
    return this.bannerRepo.find({
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepo.create(dto);
    return this.bannerRepo.save(banner);
  }

  async update(id: number, dto: Partial<CreateBannerDto>): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepo.remove(banner);
  }
}
