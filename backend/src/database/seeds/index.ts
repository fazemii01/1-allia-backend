/**
 * Layanan & WA Templates Seeder
 * ─────────────────────────────
 * Run AFTER installing packages and setting up the database.
 *
 * How to run (from serve-be/backend/):
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/index.ts
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the backend root (where you run npx ts-node from)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { DataSource } from 'typeorm';
import { LayananCategory } from '../../layanan/entities/layanan-category.entity';
import { Layanan } from '../../layanan/entities/layanan.entity';
import { WaTemplate } from '../../whatsapp/entities/wa-template.entity';
import { User } from '../../auth/entities/user.entity';
import { seedUsers } from './users.seed';
import { Partnership } from '../../partnerships/entities/partnership.entity';
import { PartnershipWhyUs } from '../../partnership-why-us/entities/partnership-why-us.entity';
import { PartnershipCollaboration } from '../../partnership-collaborations/entities/partnership-collaboration.entity';
import { PartnershipMoment } from '../../partnership-moments/entities/partnership-moment.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASS ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'alliakids_db',
  entities: [User, LayananCategory, Layanan, WaTemplate, Partnership, PartnershipWhyUs, PartnershipCollaboration, PartnershipMoment],
  synchronize: true,
});

// ─── Categories ──────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Hipnoterapi', slug: 'hipnoterapi', icon: '🧠', sort_order: 1 },
  { name: 'Terapi Wicara', slug: 'terapi-wicara', icon: '🗣️', sort_order: 2 },
  { name: 'Terapi Perilaku', slug: 'terapi-perilaku', icon: '🎯', sort_order: 3 },
  { name: 'Skrining Tumbuh Kembang', slug: 'tumbuh-kembang', icon: '📏', sort_order: 4 },
  { name: 'Analisis Sidik Jari', slug: 'sidik-jari', icon: '👆', sort_order: 5 },
  { name: 'Bimbel Jari Matik Magic', slug: 'jari-matik', icon: '✋', sort_order: 6 },
];

// ─── Layanan Data ─────────────────────────────────────────────────────
const LAYANAN_DATA = [
  {
    categorySlug: 'hipnoterapi',
    slug: 'hipnoterapi-anak',
    title: 'Hipnoterapi Anak & Dewasa',
    description:
      'Sesi terapi pikiran bawah sadar yang aman, nyaman, dan menyenangkan bagi anak menggunakan metode visualisasi dan relaksasi khusus untuk memulihkan hambatan emosi, fobia makanan, dan perilaku.',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
    stats: {
      durasi_sesi: '90 Menit / Sesi',
      format_layanan: 'Offline (Tatap Muka)',
      mulai_dari: 'Rp 550.000 / Sesi',
    },
    mengapa_memilih: [
      'Praktisi Bersertifikat Resmi: Ditangani langsung oleh terapis bersertifikat resmi dari lembaga hipnoterapi terpercaya di Indonesia.',
      'Aman & Tanpa Obat: Metode alami dengan teknik bermain, visualisasi, dan relaksasi ringan tanpa menggunakan obat-obatan.',
      'Mengatasi Hambatan Bawah Sadar: Sangat efektif mengatasi trauma makan/fobia nasi, tantrum berlebih, malas belajar, kecemasan, ngompol, dan kurang percaya diri.',
      'Keterlibatan Orang Tua: Orang tua dilibatkan dalam sesi untuk mempelajari teknik penguatan positif di rumah demi hasil berkelanjutan.',
    ],
    isu_permasalahan: [
      'Trauma Makan Nasi (Takut Nasi)',
      'Fobia Makanan / Picky Eating Akut',
      'Kebiasaan Mengompol (Enuresis)',
      'Malas Belajar & Kehilangan Motivasi',
      'Tantrum Berlebih & Emosi Meledak',
      'Trauma Masa Lalu / Korban Bullying',
      'Kurang Percaya Diri & Demam Panggung',
      'Kecanduan Gadget / Game Online',
    ],
    programs: [
      { title: 'Terapi Emosi & Perilaku', desc: 'Membantu anak mengelola emosi negatif seperti marah, sedih, takut, atau trauma secara aman.', harga: 'Rp 550.000 / Sesi' },
      { title: 'Terapi Konsentrasi & Fokus Belajar', desc: 'Meningkatkan kemampuan anak dalam berkonsentrasi, menghafal, dan menyerap pelajaran sekolah.', harga: 'Rp 550.000 / Sesi' },
      { title: 'Terapi Percaya Diri & Sosialisasi', desc: 'Membantu anak mengatasi rasa malu, minder, rendah diri, atau takut bersosialisasi di lingkungannya.', harga: 'Rp 550.000 / Sesi' },
      { title: 'Terapi Gangguan Tidur & Mimpi Buruk', desc: 'Mengatasi masalah susah tidur, sering terbangun di malam hari, ketakutan tidur sendiri, dan mimpi buruk.', harga: 'Rp 550.000 / Sesi' },
      { title: 'Terapi Pengendalian Kebiasaan Buruk', desc: 'Membantu anak menghentikan kebiasaan seperti menggigit kuku, ngompol, mengisap jempol, atau kecanduan gadget.', harga: 'Rp 550.000 / Sesi' },
      { title: 'Terapi Kecemasan & Fobia', desc: 'Mengatasi ketakutan berlebih terhadap sekolah, dokter, kegelapan, hewan, atau situasi sosial tertentu.', harga: 'Rp 550.000 / Sesi' },
    ],
    sort_order: 1,
  },
  {
    categorySlug: 'terapi-wicara',
    slug: 'terapi-wicara',
    title: 'Layanan Terapi Wicara',
    description:
      'Pendampingan intensif bagi anak yang mengalami keterlambatan bicara (speech delay), kesulitan melafalkan huruf (artikulasi), gagap, maupun kesulitan komunikasi sosial.',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600',
    stats: {
      durasi_sesi: '60 Menit / Sesi',
      format_layanan: 'Offline & Online',
      mulai_dari: 'Rp 150.000 / Sesi',
    },
    mengapa_memilih: [
      'Terapis Wicara Terlatih: Sesi dipimpin oleh terapis wicara profesional lulusan ortopedagogik/terapi wicara berlisensi.',
      'Asesmen Awal Detail: Penilaian menyeluruh terhadap kemampuan motorik mulut (oral motor), reseptif, dan ekspresif anak.',
      'Kurikulum Terapi Personal: Rencana terapi disesuaikan dengan kebutuhan wicara spesifik dan usia tumbuh kembang anak.',
      'Pelatihan Rumah untuk Orang Tua: Pembekalan teknik stimulasi harian di rumah agar melipatgandakan progres bicara anak.',
    ],
    isu_permasalahan: [
      'Speech Delay (Terlambat Bicara)',
      'Cadel / Artikulasi Huruf Kurang Jelas',
      'Gagap (Stuttering) Saat Bicara',
      'Kesulitan Memahami Kalimat Orang Lain',
      'Tidak Mau Kontak Mata Saat Diajak Bicara',
      'Suka Mengulang Kata / Ekolalia',
      'Hambatan Oro-Motor (Otot Mulut Lemah)',
    ],
    programs: [],
    sort_order: 1,
  },
  {
    categorySlug: 'terapi-perilaku',
    slug: 'terapi-perilaku',
    title: 'Layanan Terapi Perilaku',
    description:
      'Terapi penanganan masalah kepatuhan, pemusatan perhatian (ADHD/ADD), hiperaktivitas, temper tantrum berlebih, sosialisasi, dan pendampingan anak berkebutuhan khusus (ABK).',
    image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600',
    stats: {
      durasi_sesi: '60 Menit / Sesi',
      format_layanan: 'Offline (Tatap Muka)',
      mulai_dari: 'Rp 150.000 / Sesi',
    },
    mengapa_memilih: [
      'Terapis Perilaku Kompeten: Sesi ditangani oleh terapis perilaku terlatih dengan keahlian khusus di bidang psikologi perkembangan anak.',
      'Metode ABA & Play Therapy: Mengombinasikan Applied Behavior Analysis (ABA) yang terstruktur dan Terapi Bermain yang menyenangkan bagi anak.',
      'Fokus Kemandirian Anak: Melatih kemandirian harian (activity of daily living), kedisiplinan, serta kepatuhan instruksi sederhana.',
      'Modifikasi Kebiasaan Buruk: Membantu mengganti perilaku destruktif (agresif, melempar barang, memukul) menjadi ekspresi emosi yang sehat.',
    ],
    isu_permasalahan: [
      'Hiperaktivitas (Sangat Sulit Diam)',
      'Tantrum Agresif (Memukul, Menggigit, Berteriak)',
      'ADHD / Gangguan Pemusatan Perhatian',
      'Sulit Fokus / Malas Menulis & Membaca',
      'Autism Spectrum Disorder (ASD)',
      'Suka Membangkang & Menolak Aturan',
      'Kesulitan Berinteraksi & Pemalu Ekstrem',
    ],
    programs: [],
    sort_order: 1,
  },
  {
    categorySlug: 'tumbuh-kembang',
    slug: 'tumbuh-kembang',
    title: 'Skrining Tumbuh Kembang Anak',
    description:
      'Asesmen deteksi dini untuk mengetahui apakah tahap perkembangan motorik, bahasa, kognitif, dan sosial-emosional anak usia 1-5 tahun sudah sesuai dengan usianya atau terdapat keterlambatan (delay).',
    image_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600',
    stats: {
      durasi_sesi: '60 Menit / Sesi',
      format_layanan: 'Offline (Tatap Muka)',
      mulai_dari: 'Rp 150.000 / Sesi',
    },
    mengapa_memilih: [
      'Skrining Komprehensif: Menggunakan instrumen skrining baku (SDIDTK / KPSP) untuk mendeteksi dini keterlambatan perkembangan anak.',
      'Pemantauan Motorik & Sensorik: Mengukur kekuatan motorik kasar (berdiri, melompat), motorik halus (memegang pensil, menyusun balok), dan integrasi sensorik.',
      'Evaluasi Kognitif & Sosial: Mengamati cara berpikir anak, memecahkan masalah sederhana, kematangan sosio-emosional, dan interaksi dengan teman sebaya.',
      'Laporan Tumbuh Kembang Resmi: Setiap orang tua menerima laporan tertulis yang merinci grafik pencapaian anak dan rekomendasi tindak lanjut.',
    ],
    isu_permasalahan: [
      'Motorik Kasar (Keseimbangan, Jalan, Lompat)',
      'Motorik Halus (Menjepit, Menggunting, Menggambar)',
      'Kemampuan Bicara & Bahasa (Kosa Kata, Memahami Kata)',
      'Sosialisasi & Kemandirian (Bermain Bersama, Makan Sendiri)',
      'Sensori Integrasi (Keseimbangan & Kepekaan Sentuhan)',
      'Kognitif (Mengenali Warna, Bentuk, Mengelompokkan Objek)',
    ],
    programs: [],
    sort_order: 1,
  },
  {
    categorySlug: 'sidik-jari',
    slug: 'sidik-jari-bakat',
    title: 'Analisis Sidik Jari Bakat',
    description:
      'Temukan potensi terpendam, bakat bawaan sejak lahir, serta gaya belajar dominan anak secara objektif dan ilmiah melalui pemindaian pola sidik jari (fingerprint analysis).',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600',
    stats: {
      durasi_sesi: '60 Menit (Scan & Konsultasi)',
      format_layanan: 'Offline (Tatap Muka)',
      mulai_dari: 'Rp 350.000 / Sesi',
    },
    mengapa_memilih: [
      'Akurasi Ilmiah Tinggi: Menganalisis pola dermatoglifi (pola sidik jari) yang terbentuk sejak dalam kandungan, bersifat permanen dan tidak dipengaruhi mood.',
      'Pemetaan Gaya Belajar: Mengetahui secara pasti gaya belajar dominan anak (Visual, Auditori, atau Kinestetik) agar orang tua tidak salah memberikan metode belajar.',
      'Analisis Belahan Otak Dominan: Mengetahui kecenderungan kerja otak kanan (kreativitas, intuisi, holistik) atau otak kiri (analitis, logika, bahasa).',
      'Sesi Konsultasi Eksklusif: Dilengkapi dengan sesi konsultasi tatap muka untuk menjelaskan laporan hasil setebal 15+ halaman serta arahan pola asuh yang pas.',
    ],
    isu_permasalahan: [
      '8 Kecerdasan Majemuk (Musik, Kinestetik, Logika, dll.)',
      'Gaya Belajar Dominan (Visual / Auditori / Kinestetik)',
      'Karakter Komunikasi Anak (Reflektif, Afektif, Kognitif)',
      'Potensi Karier & Jurusan Sekolah di Masa Depan',
      'Kekuatan Otak Kanan vs Otak Kiri',
      'Gaya Bekerja & Manajemen Stres Bawaan',
    ],
    programs: [],
    sort_order: 1,
  },
  {
    categorySlug: 'jari-matik',
    slug: 'jari-matik-magic',
    title: 'Bimbel Jari Matik Magic',
    description:
      'Metode berhitung cepat dengan sepuluh jari tangan secara praktis, logis, dan menyenangkan. Membantu menumbuhkan rasa suka anak terhadap matematika sejak usia dini tanpa hafalan yang memberatkan.',
    image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600',
    stats: {
      durasi_sesi: 'Kelas Reguler Bulanan',
      format_layanan: 'Offline (Tatap Muka)',
      mulai_dari: 'Rp 180.000 / Bulan',
    },
    mengapa_memilih: [
      'Praktis & Mudah: Hanya menggunakan sepuluh jari tangan sendiri tanpa alat bantu sempoa atau kalkulator.',
      'Metode Menyenangkan: Pembelajaran dirancang lewat permainan interaktif, nyanyian, dan cerita agar anak senang belajar berhitung.',
      'Melatih Otak Kanan & Kiri: Menyeimbangkan fungsi otak kanan (imajinasi/kreativitas) dan otak kiri (logika/analitis) melalui gerakan jari yang sinergis.',
      'Meningkatkan Kepercayaan Diri: Anak dapat menghitung perkalian, pembagian, penjumlahan, dan pengurangan dengan cepat di sekolah tanpa merasa terbebani.',
    ],
    isu_permasalahan: [
      'Perkalian & Pembagian Cepat',
      'Penjumlahan & Pengurangan Besar',
      'Anak Takut / Tidak Suka Matematika',
      'Metode Belajar Kinestetik & Visual',
      'Berhitung Tanpa Alat Bantu',
    ],
    programs: [],
    sort_order: 1,
  },
];

// ─── WA Templates ─────────────────────────────────────────────────────
const WA_TEMPLATES = [
  {
    id: 'registration_confirm',
    name: 'Konfirmasi Pendaftaran',
    body: `Halo {nama_ortu} 👋\n\nTerima kasih telah mendaftarkan {nama_anak} di *Allia Kids*!\n\nData Pendaftaran:\n• Anak: {nama_anak} ({usia} tahun)\n• Layanan: {jenis_terapi}\n• Tgl. Pendaftaran: {tanggal}\n\nTim kami akan segera menghubungi Anda untuk konfirmasi jadwal sesi pertama.\n\nSalam hangat,\n*Tim Allia Kids* 🌟`,
    is_active: true,
  },
  {
    id: 'session_reminder',
    name: 'Pengingat Jadwal Sesi',
    body: `Halo {nama_ortu} 👋\n\nMenunggu kedatangan *{nama_anak}* besok!\n\n📅 Jadwal Sesi:\n• Hari/Tanggal: {hari}, {tanggal}\n• Waktu: {jam} WIB\n• Terapis: {nama_terapis}\n• Durasi: {durasi} menit\n\nMohon hadir 10 menit sebelum sesi dimulai.\n\nSampai jumpa!\n*Tim Allia Kids* 🌟`,
    is_active: true,
  },
  {
    id: 'invoice_billing',
    name: 'Tagihan Invoice',
    body: `Halo {nama_ortu} 👋\n\nBerikut tagihan sesi terapi untuk *{nama_anak}*:\n\n🧾 Invoice #{invoice_number}\n• Layanan: {layanan}\n• Total: *Rp {total_amount}*\n• Jatuh Tempo: {due_date}\n\nPembayaran dapat dilakukan melalui:\n• Transfer BCA: 1234567890 a/n Allia Kids\n• GoPay / OVO: 081915237935\n\nKonfirmasi pembayaran via WhatsApp ini ya!\n\nTerima kasih 🙏\n*Tim Allia Kids*`,
    is_active: true,
  },
];

async function runSeeders() {
  console.log('🔗 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Connected!\n');

  const categoryRepo = AppDataSource.getRepository(LayananCategory);
  const layananRepo = AppDataSource.getRepository(Layanan);
  const templateRepo = AppDataSource.getRepository(WaTemplate);

  // ── Seed Categories ──────────────────────────────────────────────
  console.log('📦 Seeding Layanan Categories...');
  const savedCategories: Record<string, LayananCategory> = {};

  for (const cat of CATEGORIES) {
    const existing = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (existing) {
      savedCategories[cat.slug] = existing;
      console.log(`  ⏭️  Category "${cat.name}" already exists`);
      continue;
    }
    const saved = await categoryRepo.save(categoryRepo.create(cat));
    savedCategories[cat.slug] = saved;
    console.log(`  ✅ Created category: ${cat.name}`);
  }

  // ── Seed Layanan ─────────────────────────────────────────────────
  console.log('\n📦 Seeding Layanan...');
  for (const data of LAYANAN_DATA) {
    const existing = await layananRepo.findOne({ where: { slug: data.slug } });
    if (existing) {
      console.log(`  ⏭️  Layanan "${data.title}" already exists`);
      continue;
    }
    const category = savedCategories[data.categorySlug];
    if (!category) {
      console.warn(`  ⚠️  Category "${data.categorySlug}" not found for layanan "${data.title}"`);
      continue;
    }
    const { categorySlug, ...layananData } = data;
    await layananRepo.save(layananRepo.create({ ...layananData, kategori_id: category.id }));
    console.log(`  ✅ Created layanan: ${data.title}`);
  }

  // ── Seed WA Templates ────────────────────────────────────────────
  console.log('\n📦 Seeding WA Templates...');
  for (const tpl of WA_TEMPLATES) {
    const existing = await templateRepo.findOne({ where: { id: tpl.id } });
    if (existing) {
      console.log(`  ⏭️  Template "${tpl.id}" already exists`);
      continue;
    }
    await templateRepo.save(templateRepo.create(tpl));
    console.log(`  ✅ Created template: ${tpl.id}`);
  }

  // ── Seed Partnerships ─────────────────────────────────────────────
  console.log('\n📦 Seeding Partnerships...');
  const partnershipRepo = AppDataSource.getRepository(Partnership);
  const PARTNERSHIPS = [
    { name: "Bathaholic", slug: "bathaholic", logo_url: "/assets/img/logo/partnership/bathaholic.png", sort_order: 1 },
    { name: "Earth Love Life", slug: "earth-love-life", logo_url: "/assets/img/logo/partnership/earth-love-life.png", sort_order: 2 },
    { name: "Kiehlers", slug: "kiehlers", logo_url: "/assets/img/logo/partnership/kiehlers.png", sort_order: 3 },
    { name: "Klamby", slug: "klamby", logo_url: "/assets/img/logo/partnership/klamby.png", sort_order: 4 },
    { name: "Katadata", slug: "katadata", logo_url: "/assets/img/logo/partnership/katadata.png", sort_order: 5 },
    { name: "Calf", slug: "calf", logo_url: "/assets/img/logo/partnership/calf.png", sort_order: 6 },
    { name: "KAI", slug: "kai", logo_url: "/assets/img/logo/partnership/kai.png", sort_order: 7 },
    { name: "Kemenkes", slug: "kemenkes", logo_url: "/assets/img/logo/partnership/kemenkes.png", sort_order: 8 },
    { name: "Botanical", slug: "botanical", logo_url: "/assets/img/logo/partnership/botanical.png", sort_order: 9 },
    { name: "Beeme", slug: "beeme", logo_url: "/assets/img/logo/partnership/beeme.png", sort_order: 10 },
    { name: "POPMANA", slug: "popmama", logo_url: "/assets/img/logo/partnership/popmama.png", sort_order: 11 },
    { name: "KAI Commuter", slug: "kai-commuter", logo_url: "/assets/img/logo/partnership/kai-commuter.png", sort_order: 12 }
  ];
  for (const partner of PARTNERSHIPS) {
    const existing = await partnershipRepo.findOne({ where: { slug: partner.slug } });
    if (existing) {
      console.log(`  ⏭️  Partnership "${partner.name}" already exists`);
      continue;
    }
    await partnershipRepo.save(partnershipRepo.create(partner));
    console.log(`  ✅ Created partnership: ${partner.name}`);
  }

  // ── Seed Partnership Why Us ─────────────────────────────────────────
  console.log('\n📦 Seeding Partnership Why Us...');
  const whyUsRepo = AppDataSource.getRepository(PartnershipWhyUs);
  const WHY_US_DATA = [
    { title: 'Berpengalaman & Terpercaya', description: 'Menyediakan layanan tumbuh kembang dan hipnoterapi anak dengan pendekatan teruji, hangat, dan aman.', sort_order: 1 },
    { title: 'Menghadirkan Terapis & Praktisi Profesional', description: 'Terapis wicara, terapis perilaku, dan praktisi hipnoterapi bersertifikat resmi yang ahli di bidang psikologi perkembangan anak.', sort_order: 2 },
    { title: 'Pendekatan Ramah Anak (Child-Centered)', description: 'Metode terapi dirancang melalui aktivitas bermain dan relaksasi yang menyenangkan agar anak merasa nyaman tanpa merasa dipaksa.', sort_order: 3 },
    { title: 'Mitra Lembaga Pendidikan & Komunitas', description: 'Allia Kids aktif bekerja sama dengan TK/PAUD, Sekolah Dasar, Posyandu, dan komunitas parenting untuk optimalisasi deteksi dini tumbuh kembang anak.', sort_order: 4 },
  ];
  for (const item of WHY_US_DATA) {
    const existing = await whyUsRepo.findOne({ where: { title: item.title } });
    if (existing) { console.log(`  ⏭️  WhyUs "${item.title}" already exists`); continue; }
    await whyUsRepo.save(whyUsRepo.create(item));
    console.log(`  ✅ Created WhyUs: ${item.title}`);
  }

  // ── Seed Partnership Collaborations ──────────────────────────────────
  console.log('\n📦 Seeding Partnership Collaborations...');
  const collabRepo = AppDataSource.getRepository(PartnershipCollaboration);
  const COLLAB_DATA = [
    {
      title: 'Seminar & Edukasi Parenting Sekolah',
      description: 'Terapis dan psikolog Allia Kids siap mengisi seminar sekolah (TK/SD), konten edukasi tumbuh kembang, dan sharing session komunitas orang tua.',
      images: ['/assets/img/gallery/partnership/cdk-01.webp', '/assets/img/gallery/partnership/cdk-02.webp'],
      sort_order: 1,
    },
    {
      title: 'Modul Stimulasi & Buku Terapi Mandiri',
      description: 'Kolaborasi penyusunan panduan stimulasi motorik/bahasa anak, buku terapi mandiri, serta mainan sensorik edukatif anak.',
      images: ['/assets/img/gallery/partnership/mental-health-kit-01.webp', '/assets/img/gallery/partnership/mental-health-kit-02.webp', '/assets/img/gallery/partnership/mental-health-kit-03.webp'],
      sort_order: 2,
    },
    {
      title: 'Program Skrining Tumbuh Kembang Massal',
      description: 'Mengadakan pemeriksaan motorik, kognitif, dan wicara kolektif untuk seluruh siswa di PAUD/TK/SD mitra guna deteksi dini hambatan.',
      images: ['/assets/img/gallery/partnership/giveaway-01.webp', '/assets/img/gallery/partnership/giveaway-02.webp', '/assets/img/gallery/partnership/giveaway-03.webp'],
      sort_order: 3,
    },
    {
      title: 'Parenting Support Group',
      description: 'Sesi diskusi kelompok terarah (sharing circle) bagi para orang tua bersama psikolog klinis anak untuk membahas isu pengasuhan.',
      images: ['/assets/img/gallery/partnership/healing-experience-01.webp', '/assets/img/gallery/partnership/healing-experience-02.webp', '/assets/img/gallery/partnership/healing-experience-03.webp'],
      sort_order: 4,
    },
    {
      title: 'Workshop Stimulasi & Sensori Play',
      description: 'Pelatihan praktik langsung sensori play dan stimulasi motorik kasar/halus anak bagi guru-guru sekolah atau kader posyandu.',
      images: ['/assets/img/gallery/partnership/education-program-01.webp', '/assets/img/gallery/partnership/education-program-02.webp', '/assets/img/gallery/partnership/education-program-03.webp'],
      sort_order: 5,
    },
  ];
  for (const item of COLLAB_DATA) {
    const existing = await collabRepo.findOne({ where: { title: item.title } });
    if (existing) { console.log(`  ⏭️  Collaboration "${item.title}" already exists`); continue; }
    await collabRepo.save(collabRepo.create(item));
    console.log(`  ✅ Created Collaboration: ${item.title}`);
  }

  // ── Seed Partnership Moments ──────────────────────────────────────────
  console.log('\n📦 Seeding Partnership Moments...');
  const momentRepo = AppDataSource.getRepository(PartnershipMoment);
  const MOMENTS_DATA = [
    { title: 'Skrining Tumbuh Kembang & Wicara Massal di TK/PAUD Lumajang', img_url: '/assets/img/gallery/partnership/documentation-kai.webp', sort_order: 1 },
    { title: 'Workshop Deteksi Dini Keterlambatan Bicara bersama Guru TK', img_url: '/assets/img/gallery/partnership/documentation-kiehlers.webp', sort_order: 2 },
    { title: 'Talkshow Parenting: Mengatasi Tantrum Anak tanpa Amarah', img_url: '/assets/img/gallery/partnership/documentation-calf.webp', sort_order: 3 },
    { title: 'Edukasi Sensori Play & Stimulasi Motorik Halus Toddler', img_url: '/assets/img/gallery/partnership/documentation-ariel-tatum.webp', sort_order: 4 },
    { title: 'Analisis Sidik Jari Bakat Siswa Sekolah Dasar', img_url: '/assets/img/gallery/partnership/documentation-taman-kota-fest.webp', sort_order: 5 },
    { title: 'Sharing Session Orang Tua Anak Berkebutuhan Khusus', img_url: '/assets/img/gallery/partnership/documentation-influencers.webp', sort_order: 6 },
  ];
  for (const item of MOMENTS_DATA) {
    const existing = await momentRepo.findOne({ where: { title: item.title } });
    if (existing) { console.log(`  ⏭️  Moment "${item.title}" already exists`); continue; }
    await momentRepo.save(momentRepo.create(item));
    console.log(`  ✅ Created Moment: ${item.title}`);
  }

  // ── Seed Users ───────────────────────────────────────────────────
  await seedUsers(AppDataSource);

  console.log('\n🎉 Seeding complete!');
  await AppDataSource.destroy();
}

runSeeders().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
