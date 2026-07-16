import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

export interface AppointmentFilters {
  date?: string;
  therapist_id?: number;
  status?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async findAll(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const query = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .orderBy('appointment.scheduled_at', 'ASC');

    if (filters.date) {
      query.andWhere('DATE(appointment.scheduled_at) = :date', {
        date: filters.date,
      });
    }

    if (filters.therapist_id) {
      query.andWhere('appointment.therapist_id = :therapist_id', {
        therapist_id: filters.therapist_id,
      });
    }

    if (filters.status) {
      query.andWhere('appointment.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: { patient: true, therapist: true },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment #${id} not found`);
    }
    return appointment;
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepo.create({
      ...dto,
      scheduled_at: new Date(dto.scheduled_at),
    });
    return this.appointmentRepo.save(appointment);
  }

  async update(id: number, dto: Partial<CreateAppointmentDto>): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (dto.scheduled_at) {
      (dto as any).scheduled_at = new Date(dto.scheduled_at);
    }
    Object.assign(appointment, dto);
    return this.appointmentRepo.save(appointment);
  }

  async cancel(id: number): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = 'dibatalkan';
    return this.appointmentRepo.save(appointment);
  }

  async findMyAppointments(whatsapp: string, email: string | null): Promise<Appointment[]> {
    const query = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.therapist', 'therapist')
      .where('(patient.no_telepon = :whatsapp' + (email ? ' OR patient.email_ortu = :email' : '') + ')', {
        whatsapp,
        email,
      })
      .orderBy('appointment.scheduled_at', 'DESC');
    
    return query.getMany();
  }
}
