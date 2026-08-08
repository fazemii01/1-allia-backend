import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { normalizeStorageUrl } from '../shared/minio.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  private normalizeBanner(banner: Banner): Banner {
    if (banner.image_url) banner.image_url = normalizeStorageUrl(banner.image_url);
    if (banner.mobile_image_url) banner.mobile_image_url = normalizeStorageUrl(banner.mobile_image_url);
    return banner;
  }

  async findAllActive(type?: string): Promise<Banner[]> {
    const where: any = { is_active: true };
    if (type) {
      where.type = type;
    } else {
      where.type = 'hero';
    }
    const banners = await this.bannerRepo.find({
      where,
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
    return banners.map((b) => this.normalizeBanner(b));
  }

  async findAllAdmin(type?: string): Promise<Banner[]> {
    const where: any = {};
    if (type) where.type = type;
    const banners = await this.bannerRepo.find({
      where,
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
    return banners.map((b) => this.normalizeBanner(b));
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return this.normalizeBanner(banner);
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    if (dto.image_url) dto.image_url = normalizeStorageUrl(dto.image_url);
    if (dto.mobile_image_url) dto.mobile_image_url = normalizeStorageUrl(dto.mobile_image_url);
    const banner = this.bannerRepo.create(dto);
    const saved = await this.bannerRepo.save(banner);
    return this.normalizeBanner(saved);
  }

  async update(id: number, dto: Partial<CreateBannerDto>): Promise<Banner> {
    if (dto.image_url) dto.image_url = normalizeStorageUrl(dto.image_url);
    if (dto.mobile_image_url) dto.mobile_image_url = normalizeStorageUrl(dto.mobile_image_url);
    const banner = await this.findOne(id);
    Object.assign(banner, dto);
    const saved = await this.bannerRepo.save(banner);
    return this.normalizeBanner(saved);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepo.remove(banner);
  }
}
