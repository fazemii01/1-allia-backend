import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
  ) {}

  async findAllActive(): Promise<Testimonial[]> {
    return this.testimonialRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', id: 'DESC' },
    });
  }

  async findAllAdmin(): Promise<Testimonial[]> {
    return this.testimonialRepo.find({
      order: { sort_order: 'ASC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Testimonial> {
    const item = await this.testimonialRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Testimonial dengan ID ${id} tidak ditemukan`);
    }
    return item;
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const item = this.testimonialRepo.create(dto);
    return this.testimonialRepo.save(item);
  }

  async update(id: number, dto: Partial<CreateTestimonialDto>): Promise<Testimonial> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.testimonialRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.testimonialRepo.remove(item);
  }
}
