import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaLog } from './entities/wa-log.entity';
import { WaTemplate } from './entities/wa-template.entity';

export interface SaveLogDto {
  patient_id?: number;
  recipient: string;
  patient_name?: string;
  type: string;
  body: string;
  status?: string;
}

@Injectable()
export class WhatsAppService {
  constructor(
    @InjectRepository(WaLog)
    private readonly logRepo: Repository<WaLog>,
    @InjectRepository(WaTemplate)
    private readonly templateRepo: Repository<WaTemplate>,
  ) {}

  findAllLogs(patientId?: number): Promise<WaLog[]> {
    const query = this.logRepo.createQueryBuilder('log')
      .leftJoinAndSelect('log.patient', 'patient')
      .orderBy('log.created_at', 'DESC');
    if (patientId) query.where('log.patient_id = :patientId', { patientId });
    return query.getMany();
  }

  saveLog(dto: SaveLogDto): Promise<WaLog> {
    const log = this.logRepo.create({ ...dto, status: dto.status ?? 'sent' });
    return this.logRepo.save(log);
  }

  findAllTemplates(): Promise<WaTemplate[]> {
    return this.templateRepo.find({ order: { id: 'ASC' } });
  }

  async updateTemplate(id: string, body: string): Promise<WaTemplate> {
    const tpl = await this.templateRepo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException(`Template "${id}" not found`);
    tpl.body = body;
    return this.templateRepo.save(tpl);
  }
}
