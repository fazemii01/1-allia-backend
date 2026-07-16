import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, ILike } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

export interface PatientFilters {
  search?: string;
  jenis_terapi?: string;
  status?: string;
}

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async findAll(filters: PatientFilters = {}): Promise<Patient[]> {
    const query = this.patientRepo.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.therapist', 'therapist')
      .orderBy('patient.created_at', 'DESC');

    if (filters.search) {
      query.andWhere(
        '(patient.nama_lengkap ILIKE :search OR patient.no_telepon ILIKE :search OR patient.email_ortu ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.jenis_terapi) {
      query.andWhere('patient.jenis_terapi = :jenis_terapi', {
        jenis_terapi: filters.jenis_terapi,
      });
    }

    if (filters.status) {
      query.andWhere('patient.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: { therapist: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient #${id} not found`);
    }
    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    // Check if duplicate patient exists under same parent phone (case-insensitive and trimmed)
    if (dto.nama_lengkap && dto.no_telepon) {
      const trimmedName = dto.nama_lengkap.trim();
      const trimmedPhone = dto.no_telepon.trim();
      const existing = await this.patientRepo.findOne({
        where: {
          nama_lengkap: ILike(trimmedName),
          no_telepon: trimmedPhone,
        },
      });

      if (existing) {
        // Merge jenis_terapi if new one is different
        if (dto.jenis_terapi && existing.jenis_terapi !== dto.jenis_terapi) {
          if (existing.jenis_terapi) {
            if (!existing.jenis_terapi.includes(dto.jenis_terapi)) {
              existing.jenis_terapi = `${existing.jenis_terapi}, ${dto.jenis_terapi}`;
            }
          } else {
            existing.jenis_terapi = dto.jenis_terapi;
          }
        }

        // Merge questionnaires
        if (dto.formulir_wicara) {
          existing.formulir_wicara = {
            ...(existing.formulir_wicara || {}),
            ...dto.formulir_wicara,
          };
        }
        if (dto.formulir_hipoterapi) {
          existing.formulir_hipoterapi = {
            ...(existing.formulir_hipoterapi || {}),
            ...dto.formulir_hipoterapi,
          };
        }

        // Update other fields
        if (dto.usia) existing.usia = dto.usia;
        if (dto.alamat) existing.alamat = dto.alamat;
        if (dto.nama_ayah) existing.nama_ayah = dto.nama_ayah;
        if (dto.nama_ibu) existing.nama_ibu = dto.nama_ibu;
        
        // Reset status to 'baru' so admin sees the new registration request
        existing.status = 'baru';

        return this.patientRepo.save(existing);
      }
    }

    const patient = this.patientRepo.create(dto);
    return this.patientRepo.save(patient);
  }

  async update(id: number, dto: Partial<CreatePatientDto>): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }

  async remove(id: number): Promise<{ message: string }> {
    const patient = await this.findOne(id);
    await this.patientRepo.remove(patient);
    return { message: `Patient #${id} deleted successfully` };
  }

  async findMyActiveTherapies(whatsapp: string, email: string | null): Promise<Patient[]> {
    const query = this.patientRepo.createQueryBuilder('patient')
      .where('(patient.no_telepon = :whatsapp' + (email ? ' OR patient.email_ortu = :email' : '') + ')', {
        whatsapp,
        email,
      })
      .andWhere('patient.status != :status', { status: 'dibatalkan' })
      .orderBy('patient.created_at', 'DESC');
    
    return query.getMany();
  }
}
