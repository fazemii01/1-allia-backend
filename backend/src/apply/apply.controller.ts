import { Controller, Post, Body } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { InvoicesService } from '../invoices/invoices.service';
import { AuthService } from '../auth/auth.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Controller('apply')
export class ApplyController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly invoicesService: InvoicesService,
    private readonly authService: AuthService,
    private readonly whatsappService: WhatsAppService,
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
        program_spesifik: payload.program || payload.program_detail,
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
        program_spesifik: payload.program || payload.program_detail,
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

    // Auto register/login user account if password provided
    let authResult: any = null;
    if (payload.password) {
      try {
        authResult = await this.authService.register({
          name: payload.nama_ibu || payload.nama_ayah || payload.nama_lengkap,
          whatsapp: payload.no_telepon,
          email: payload.email_ortu,
          password: payload.password,
          child_name: payload.nama_lengkap,
          child_age: payload.usia ? Number(payload.usia) : undefined,
          child_tempat_lahir: payload.tempat_lahir,
          child_tanggal_lahir: payload.tanggal_lahir,
          child_jenis_kelamin: payload.jenis_kelamin,
        });
      } catch (err) {
        try {
          authResult = await this.authService.login({
            email: payload.email_ortu,
            whatsapp: payload.no_telepon,
            password: payload.password,
          });
        } catch (loginErr) {
          console.warn('Auto registration/login during apply skipped:', loginErr.message);
        }
      }
    }

    // Determine total registration / package fee dynamically from payload
    const baseFullAmount = payload.total_price ? Number(payload.total_price) : 0;

    const isDp50 = payload.payment_option === 'dp_50' || payload.payment_type === 'dp_50' || payload.payment_type === 'dp';
    const isCustom = payload.payment_option === 'custom';
    const customAmount = isCustom && payload.custom_payment_amount ? Number(payload.custom_payment_amount) : 0;

    let invoiceAmount: number;
    let paymentType: string;
    let dpPercentage: number;
    let installmentNo: number;

    if (isCustom && customAmount > 0) {
      // Custom amount — could be partial or full
      invoiceAmount = Math.min(customAmount, baseFullAmount);
      const isEffectivelyFull = invoiceAmount >= baseFullAmount;
      paymentType = isEffectivelyFull ? 'full' : 'custom';
      dpPercentage = isEffectivelyFull ? 100 : Math.round((invoiceAmount / baseFullAmount) * 100);
      installmentNo = 1;
    } else if (isDp50) {
      invoiceAmount = Math.round(baseFullAmount * 0.5);
      paymentType = 'dp';
      dpPercentage = 50;
      installmentNo = 1;
    } else {
      invoiceAmount = baseFullAmount;
      paymentType = 'full';
      dpPercentage = 100;
      installmentNo = 1;
    }

    // Create due date string 3 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    let createdInvoice: any = null;
    try {
      const itemTitle = payload.program_detail || payload.jenis_terapi;
      let desc: string;
      if (paymentType === 'custom') {
        desc = `Cicilan Ke-1 \u2014 ${dpPercentage}% Pendaftaran & Sesi Terapi (${itemTitle})`;
      } else if (paymentType === 'dp') {
        desc = `Biaya DP 50% Pendaftaran & Sesi Terapi (${itemTitle})`;
      } else {
        desc = `Biaya Pendaftaran & Sesi Terapi (${itemTitle})`;
      }

      createdInvoice = await this.invoicesService.create({
        patient_id: patient.id,
        payment_type: paymentType,
        dp_percentage: dpPercentage,
        full_amount: baseFullAmount,
        installment_no: installmentNo,
        payment_method: 'transfer',
        items: [
          {
            description: desc,
            amount: invoiceAmount,
          },
        ],
        due_date: dueDateStr,
      });
    } catch (e) {
      console.warn('Invoice generation skipped or failed:', e);
    }

    // Auto-send registration & invoice WA notifications
    try {
      if (payload.no_telepon) {
        const invToken = createdInvoice?.invoice_token || createdInvoice?.invoice_number || createdInvoice?.id || '';
        const invoiceLink = invToken ? `https://app.alliakids.com/invoice/${invToken}` : '';

        // 1. Trigger apply_created
        await this.whatsappService.sendByTrigger('apply_created', payload.no_telepon, {
          nama_ortu: payload.nama_ibu || payload.nama_ayah || 'Bapak/Ibu',
          nama_anak: payload.nama_lengkap,
          usia: payload.usia || '-',
          jenis_terapi: payload.jenis_terapi || '-',
          tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          link_invoice: invoiceLink,
          invoice_number: createdInvoice?.invoice_number || '',
          total_amount: createdInvoice ? Number(createdInvoice.total_amount).toLocaleString('id-ID') : '',
        }, { patient_id: patient.id, patient_name: payload.nama_lengkap });

        // 2. Trigger invoice_created at the same time if invoice was created
        if (createdInvoice) {
          const firstItem = createdInvoice.items?.[0];
          await this.whatsappService.sendByTrigger('invoice_created', payload.no_telepon, {
            nama_ortu: payload.nama_ibu || payload.nama_ayah || 'Bapak/Ibu',
            nama_anak: payload.nama_lengkap,
            invoice_number: createdInvoice.invoice_number,
            layanan: firstItem?.description || payload.jenis_terapi || '',
            total_amount: Number(createdInvoice.total_amount).toLocaleString('id-ID'),
            due_date: createdInvoice.due_date,
            link_invoice: invoiceLink,
          }, { patient_id: patient.id, patient_name: payload.nama_lengkap });
        }
      }
    } catch (e) {
      console.warn('WA apply_created / invoice_created notification error:', e);
    }

    return {
      success: true,
      message: 'Formulir pendaftaran berhasil dikirim. Tim kami akan segera menghubungi Anda.',
      patientId: patient.id,
      auth: authResult,
    };
  }
}
