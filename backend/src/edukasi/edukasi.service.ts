import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Edukasi } from './entities/edukasi.entity';
import { CreateEdukasiDto } from './dto/create-edukasi.dto';

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

@Injectable()
export class EdukasiService {
  constructor(
    @InjectRepository(Edukasi)
    private readonly repo: Repository<Edukasi>,
  ) {}

  findAll(category?: string, publishedOnly = false): Promise<Edukasi[]> {
    const query = this.repo.createQueryBuilder('edukasi').orderBy('edukasi.created_at', 'DESC');
    if (category) query.andWhere('edukasi.category = :category', { category });
    if (publishedOnly) query.andWhere('edukasi.is_published = true');
    return query.getMany();
  }

  async findOne(id: number): Promise<Edukasi> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Edukasi #${id} not found`);
    return item;
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<Edukasi> {
    const where: any = { slug };
    if (publishedOnly) where.is_published = true;
    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException(`Edukasi with slug ${slug} not found`);
    return item;
  }

  async create(dto: CreateEdukasiDto): Promise<Edukasi> {
    const slug = dto.slug ?? toSlug(dto.title);
    const item = this.repo.create({ ...dto, slug });
    return this.repo.save(item);
  }

  async update(id: number, dto: Partial<CreateEdukasiDto>): Promise<Edukasi> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async publish(id: number): Promise<Edukasi> {
    const item = await this.findOne(id);
    item.is_published = !item.is_published;
    item.published_at = item.is_published ? new Date() : null;
    return this.repo.save(item);
  }

  async remove(id: number): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { message: `Edukasi #${id} deleted` };
  }
}
