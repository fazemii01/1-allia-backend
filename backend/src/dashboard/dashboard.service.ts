import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Therapist } from '../therapists/entities/therapist.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Therapist)
    private readonly therapistRepo: Repository<Therapist>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async getStats() {
    // 1. Total Patients
    const totalPatients = await this.patientRepo.count();

    // 2. Total Therapists (Active)
    const activeTherapists = await this.therapistRepo.count({ where: { is_active: true } });

    // 3. Weekly Sessions (Appointments in the current week)
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7); // Next Sunday

    const weeklySessions = await this.appointmentRepo.count({
      where: {
        scheduled_at: Between(startOfWeek, endOfWeek),
      },
    });

    // 4. Pending Invoices (Belum Bayar) count and sum
    const unpaidInvoices = await this.invoiceRepo.find({
      where: { status: 'belum_bayar' },
    });
    const pendingInvoicesCount = unpaidInvoices.length;
    const pendingInvoicesAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);

    // 5. Recent Patients registrations (top 5)
    const recentPatients = await this.patientRepo.find({
      order: { created_at: 'DESC' },
      take: 5,
    });

    // 6. Category stats (group by jenis_terapi)
    const categoryRaw = await this.patientRepo
      .createQueryBuilder('patient')
      .select('patient.jenis_terapi', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('patient.jenis_terapi')
      .getRawMany();

    const categoryStats = categoryRaw.map((c) => ({
      category: c.category || 'Belum Ditentukan',
      count: parseInt(c.count, 10),
    }));

    // 7. Monthly appointments overview (for chart)
    const monthlyRaw = await this.appointmentRepo
      .createQueryBuilder('app')
      .select("TO_CHAR(app.scheduled_at, 'Mon')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy("TO_CHAR(app.scheduled_at, 'Mon')")
      .getRawMany();
      
    // Order months logically: Jan-Dec
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyOverview = monthOrder.map((m) => {
      const found = monthlyRaw.find((r) => r.month === m);
      return {
        name: m,
        total: found ? parseInt(found.count, 10) : 0,
      };
    });

    return {
      cards: {
        totalPatients,
        activeTherapists,
        weeklySessions,
        pendingInvoicesCount,
        pendingInvoicesAmount,
      },
      recentPatients,
      categoryStats,
      monthlyOverview,
    };
  }
}
