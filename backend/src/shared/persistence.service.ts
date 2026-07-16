import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class PersistenceService {
  private readonly patientsFile = path.join(process.cwd(), "patients.json");
  private readonly whatsappFile = path.join(process.cwd(), "whatsapp.json");
  private readonly templatesFile = path.join(process.cwd(), "templates.json");

  constructor() {
    this.initFile(this.patientsFile, []);
    this.initFile(this.whatsappFile, []);
    this.initFile(this.templatesFile, [
      {
        id: "registration_confirm",
        name: "Konfirmasi Registrasi Baru",
        body: "Halo Ayah/Bunda dari {{nama_anak}}, terima kasih telah mengisi formulir pendaftaran di Allia Kids. Terapis kami akan segera menghubungi Anda untuk menjadwalkan konsultasi awal.",
        isActive: true,
      },
      {
        id: "session_reminder",
        name: "Pengingat Sesi Terapi",
        body: "Halo Ayah/Bunda dari {{nama_anak}}, mengingatkan kembali jadwal terapi wicara sikecil besok tanggal {{tanggal_terapi}} jam {{jam_terapi}} bersama terapis {{nama_terapis}}.",
        isActive: true,
      },
      {
        id: "invoice_billing",
        name: "Tagihan Bulanan Sesi",
        body: "Halo Ayah/Bunda dari {{nama_anak}}, berikut kami kirimkan rincian invoice untuk sesi terapi bulan {{bulan_tagihan}}. Total pembayaran adalah {{total_bayar}}.",
        isActive: true,
      }
    ]);
  }

  private initFile(filePath: string, defaultData: any) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
    }
  }

  // Patients
  getPatients(): any[] {
    const data = fs.readFileSync(this.patientsFile, "utf8");
    return JSON.parse(data);
  }

  savePatient(patient: any): any {
    const patients = this.getPatients();
    const newPatient = {
      id: Date.now().toString(),
      status: "baru",
      createdAt: new Date().toISOString(),
      ...patient,
    };
    patients.push(newPatient);
    fs.writeFileSync(this.patientsFile, JSON.stringify(patients, null, 2), "utf8");
    return newPatient;
  }

  updatePatient(id: string, updateData: any): any {
    const patients = this.getPatients();
    const idx = patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    patients[idx] = { ...patients[idx], ...updateData };
    fs.writeFileSync(this.patientsFile, JSON.stringify(patients, null, 2), "utf8");
    return patients[idx];
  }

  // WhatsApp Logs
  getLogs(): any[] {
    const data = fs.readFileSync(this.whatsappFile, "utf8");
    return JSON.parse(data);
  }

  saveLog(log: any): any {
    const logs = this.getLogs();
    const newLog = {
      id: "LOG" + Math.floor(Math.random() * 10000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      ...log,
    };
    logs.push(newLog);
    fs.writeFileSync(this.whatsappFile, JSON.stringify(logs, null, 2), "utf8");
    return newLog;
  }

  // Templates
  getTemplates(): any[] {
    const data = fs.readFileSync(this.templatesFile, "utf8");
    return JSON.parse(data);
  }

  updateTemplate(id: string, body: string): any {
    const templates = this.getTemplates();
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    templates[idx].body = body;
    fs.writeFileSync(this.templatesFile, JSON.stringify(templates, null, 2), "utf8");
    return templates[idx];
  }
}
