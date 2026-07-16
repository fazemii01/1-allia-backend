import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from './entities/therapist.entity';
import { CreateTherapistDto } from './dto/create-therapist.dto';

@Injectable()
export class TherapistsService {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
  ) {}

  async findAll(): Promise<Therapist[]> {
    return this.therapistRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Therapist> {
    const therapist = await this.therapistRepo.findOne({ where: { id } });
    if (!therapist) {
      throw new NotFoundException(`Therapist #${id} not found`);
    }
    return therapist;
  }

  async create(dto: CreateTherapistDto): Promise<Therapist> {
    const therapist = this.therapistRepo.create(dto);
    return this.therapistRepo.save(therapist);
  }

  async update(id: number, dto: Partial<CreateTherapistDto>): Promise<Therapist> {
    const therapist = await this.findOne(id);
    Object.assign(therapist, dto);
    return this.therapistRepo.save(therapist);
  }

  async remove(id: number): Promise<{ message: string }> {
    const therapist = await this.findOne(id);
    await this.therapistRepo.remove(therapist);
    return { message: `Therapist #${id} deleted successfully` };
  }
}
