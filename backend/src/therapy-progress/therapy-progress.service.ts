import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TherapyProgressLog } from './entities/therapy-progress-log.entity';
import { CreateTherapyProgressLogDto } from './dto/create-therapy-progress-log.dto';

@Injectable()
export class TherapyProgressService {
  constructor(
    @InjectRepository(TherapyProgressLog)
    private readonly progressRepo: Repository<TherapyProgressLog>,
  ) {}

  async findByPatient(patientId: number): Promise<TherapyProgressLog[]> {
    return this.progressRepo.find({
      where: { patient_id: patientId },
      relations: { therapist: true, patient: true },
      order: { session_number: 'ASC', created_at: 'ASC' },
    });
  }

  async findMyProgress(whatsapp: string, email?: string | null): Promise<TherapyProgressLog[]> {
    const query = this.progressRepo
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.patient', 'patient')
      .leftJoinAndSelect('progress.therapist', 'therapist')
      .where('(patient.no_telepon = :whatsapp' + (email ? ' OR patient.email_ortu = :email' : '') + ')', {
        whatsapp,
        email,
      })
      .orderBy('progress.session_number', 'ASC');

    return query.getMany();
  }

  async create(dto: CreateTherapyProgressLogDto): Promise<TherapyProgressLog> {
    const log = this.progressRepo.create(dto);
    return this.progressRepo.save(log);
  }

  async update(id: number, dto: Partial<CreateTherapyProgressLogDto>): Promise<TherapyProgressLog> {
    const log = await this.progressRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Therapy progress log #${id} not found`);
    Object.assign(log, dto);
    return this.progressRepo.save(log);
  }

  async remove(id: number): Promise<{ message: string }> {
    const log = await this.progressRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Therapy progress log #${id} not found`);
    await this.progressRepo.remove(log);
    return { message: `Log #${id} deleted` };
  }
}
