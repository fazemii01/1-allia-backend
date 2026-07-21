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
    const isWicara = (payload.jenis_terapi || '').toLowerCase().includes('wicara');
    
    // Construct structured DTO for PatientsService
    const patientDto: any = {
      nama_lengkap: payload.nama_lengkap,
      usia: payload.usia ? Number(payload.usia) : null,
      tempat_lahir: payload.tempat_lahir,
      tanggal_lahir: payload.tanggal_lahir,
      jenis_kelamin: payload.jenis_kelamin,
      email_ortu: payload.email_ortu,
      no_telepon: payload.no_telepon,
      nama_ayah: payload.nama_ayah,
      nama_ibu: payload.nama_ibu,
      alamat: payload.alamat,
      jenis_terapi: payload.jenis_terapi,
      pendidikan_anak: payload.pendidikan_anak,
      relasi_sosial: payload.relasi_sosial,
      relasi_dengan_ibu: payload.relasi_dengan_ibu,
      relasi_dengan_saudara: payload.relasi_dengan_saudara,
      status: 'baru',
    };

    if (isWicara || payload.masalah_bicara || payload.gangguan_utama) {
      patientDto.formulir_wicara = {
        masalah_bicara: payload.masalah_bicara,
        sudah_berapa_lama: payload.sudah_berapa_lama_wicara || payload.sudah_berapa_lama,
        dalam_penanganan_lain: payload.dalam_penanganan_lain,
        nama_penanganan_lain: payload.nama_penanganan_lain,
        bahasa_sehari_hari: payload.bahasa_sehari_hari_wicara || payload.bahasa_sehari_hari,
        gangguan_utama: payload.gangguan_utama,
        keluhan_lainnya: payload.keluhan_lainnya,
        pengurus_utama: payload.pengurus_utama_wicara || payload.pengurus_utama,
        masalah_kehamilan: payload.masalah_kehamilan_wicara || payload.masalah_kehamilan,
        detail_masalah_kehamilan: payload.detail_masalah_kehamilan_wicara || payload.detail_masalah_kehamilan,
        riwayat_keterlambatan: payload.riwayat_keterlambatan,
        detail_keterlambatan: payload.detail_keterlambatan,
        harapan_terapi: payload.harapan_terapi_wicara || payload.harapan_terapi,
        pernah_trauma: payload.pernah_trauma_wicara || payload.pernah_trauma,
        detail_trauma: payload.detail_trauma_wicara || payload.detail_trauma,
        pernah_terapi_sebelumnya: payload.pernah_terapi_sebelumnya,
        ada_kekhawatiran_terapi: payload.ada_kekhawatiran_terapi,
        detail_kekhawatiran: payload.detail_kekhawatiran,
      };
    }

    if (!isWicara || payload.keluhan_utama || payload.penjelasan_keluhan) {
      patientDto.formulir_hipoterapi = {
        keluhan_utama: payload.keluhan_utama,
        penjelasan_keluhan: payload.penjelasan_keluhan,
        sudah_berapa_lama: payload.sudah_berapa_lama_hipo || payload.sudah_berapa_lama,
        dalam_penanganan_dokter: payload.dalam_penanganan_dokter,
        nama_dokter: payload.nama_dokter,
        pengurus_utama: payload.pengurus_utama_hipo || payload.pengurus_utama,
        bahasa_sehari_hari: payload.bahasa_sehari_hari_hipo || payload.bahasa_sehari_hari,
        masalah_kehamilan: payload.masalah_kehamilan_hipo || payload.masalah_kehamilan,
        detail_masalah_kehamilan: payload.detail_masalah_kehamilan_hipo || payload.detail_masalah_kehamilan,
        pernah_trauma: payload.pernah_trauma_hipo || payload.pernah_trauma,
        detail_trauma: payload.detail_trauma_hipo || payload.detail_trauma,
        harapan_terapi: payload.harapan_terapi_hipo || payload.harapan_terapi,
        tempat_favorit: payload.tempat_favorit,
        hobby: payload.hobby,
        pernah_hipnoterapi: payload.pernah_hipnoterapi,
        ada_ketakutan_terapi: payload.ada_ketakutan_terapi,
        detail_ketakutan: payload.detail_ketakutan,
      };
    }

    // Save patient to PostgreSQL via PatientsService
    const patient = await this.patientsService.create(patientDto);

    // Determine registration / assessment fee dynamically
    const isHipo = (payload.jenis_terapi || '').toLowerCase().includes('hipno') || (payload.jenis_terapi || '').toLowerCase().includes('hipot');
    const amount = isHipo ? 550000 : 150000;

    // Create due date string 3 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    // Auto-generate invoice
    try {
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
    } catch (e) {
      console.warn('Invoice generation skipped or failed:', e);
    }

    return {
      success: true,
      message: 'Formulir pendaftaran berhasil dikirim. Tim kami akan segera menghubungi Anda.',
      patientId: patient.id,
    };
  }
}
