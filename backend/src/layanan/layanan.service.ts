import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Layanan } from './entities/layanan.entity';
import { LayananCategory } from './entities/layanan-category.entity';
import { CreateLayananDto, CreateLayananCategoryDto } from './dto/create-layanan.dto';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

@Injectable()
export class LayananService {
  constructor(
    @InjectRepository(Layanan)
    private readonly layananRepo: Repository<Layanan>,
    @InjectRepository(LayananCategory)
    private readonly categoryRepo: Repository<LayananCategory>,
  ) {}

  // ── Categories ──────────────────────────────────────────────────────
  findAllCategories(): Promise<LayananCategory[]> {
    return this.categoryRepo.find({
      relations: { layanan: true },
      order: { sort_order: 'ASC' },
    });
  }

  async findOneCategory(id: number): Promise<LayananCategory> {
    const cat = await this.categoryRepo.findOne({ where: { id }, relations: { layanan: true } });
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    return cat;
  }

  async createCategory(dto: CreateLayananCategoryDto): Promise<LayananCategory> {
    const slug = dto.slug ?? toSlug(dto.name);
    const cat = this.categoryRepo.create({ ...dto, slug });
    return this.categoryRepo.save(cat);
  }

  async updateCategory(id: number, dto: Partial<CreateLayananCategoryDto>): Promise<LayananCategory> {
    const cat = await this.findOneCategory(id);
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async removeCategory(id: number): Promise<{ message: string }> {
    const cat = await this.findOneCategory(id);
    await this.categoryRepo.remove(cat);
    return { message: `Category #${id} deleted` };
  }

  // ── Layanan ──────────────────────────────────────────────────────────
  findAll(activeOnly = false): Promise<Layanan[]> {
    const query = this.layananRepo
      .createQueryBuilder('layanan')
      .leftJoinAndSelect('layanan.category', 'category')
      .orderBy('layanan.sort_order', 'ASC');

    if (activeOnly) {
      query.where('layanan.is_active = true');
    }

    return query.getMany();
  }

  async findBySlug(slug: string): Promise<Layanan> {
    const layanan = await this.layananRepo.findOne({
      where: { slug, is_active: true },
      relations: { category: true },
    });
    if (!layanan) throw new NotFoundException(`Layanan "${slug}" not found`);
    return layanan;
  }

  async findOne(id: number): Promise<Layanan> {
    const layanan = await this.layananRepo.findOne({ where: { id }, relations: { category: true } });
    if (!layanan) throw new NotFoundException(`Layanan #${id} not found`);
    return layanan;
  }

  async create(dto: CreateLayananDto): Promise<Layanan> {
    const slug = dto.slug ?? toSlug(dto.title);
    const layanan = this.layananRepo.create({ ...dto, slug });
    return this.layananRepo.save(layanan);
  }

  async update(id: number, dto: Partial<CreateLayananDto>): Promise<Layanan> {
    const layanan = await this.findOne(id);
    Object.assign(layanan, dto);
    return this.layananRepo.save(layanan);
  }

  async remove(id: number): Promise<{ message: string }> {
    const layanan = await this.findOne(id);
    await this.layananRepo.remove(layanan);
    return { message: `Layanan #${id} deleted` };
  }
}
