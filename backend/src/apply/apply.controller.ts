import { Controller, Post, Body } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { InvoicesService } from '../invoices/invoices.service';

@Controller('apply')
export class ApplyController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Post()
  async submitForm(@Body() payload: any) {
    // Save patient to PostgreSQL via PatientsService
    const patient = await this.patientsService.create(payload);

    // Determine registration / assessment fee dynamically
    const isHipo = (payload.jenis_terapi || '').toLowerCase().includes('hipno') || (payload.jenis_terapi || '').toLowerCase().includes('hipot');
    const amount = isHipo ? 550000 : 150000;

    // Create due date string 3 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    // Auto-generate invoice
    await this.invoicesService.create({
      patient_id: patient.id,
      items: [
        {
          description: `Biaya Pendaftaran & Asesmen Awal (${payload.jenis_terapi})`,
          amount: amount,
        },
      ],
      due_date: dueDateStr,
    });

    return {
      success: true,
      message: 'Formulir pendaftaran berhasil dikirim. Tim kami akan segera menghubungi Anda.',
      patientId: patient.id,
    };
  }
}
