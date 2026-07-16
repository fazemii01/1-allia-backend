import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Therapist } from './entities/therapist.entity';

@Controller('therapists')
export class TherapistsPublicController {
  constructor(
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
  ) {}

  @Get()
  async getActive() {
    return this.therapistRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}
