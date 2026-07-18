const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const env = {
    DATABASE_HOST: '46.250.235.11',
    DATABASE_PORT: 35432,
    DATABASE_USER: 'postgres',
    DATABASE_PASS: 'alexandria20',
    DATABASE_NAME: 'alliakids',
  };

  const client = new Client({
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASS,
    database: env.DATABASE_NAME,
  });

  try {
    await client.connect();
    console.log(`Connected to database at ${env.DATABASE_HOST}`);

    // Begin transaction
    await client.query('BEGIN');

    // 1. Identify category IDs to keep (Skrining Tumbuh Kembang & Analisis Sidik Jari Bakat)
    const keepCatsRes = await client.query(`
      SELECT id, slug FROM "ak_layanan_categories" 
      WHERE slug LIKE '%tumbuh-kembang%' OR slug LIKE '%sidik-jari%' OR slug LIKE '%bakat%'
    `);
    const keepCatIds = keepCatsRes.rows.map(row => row.id);
    console.log('Categories to keep IDs:', keepCatIds);

    // 2. Delete all services NOT in the categories we want to keep
    if (keepCatIds.length > 0) {
      await client.query(`
        DELETE FROM "ak_layanan" 
        WHERE "kategori_id" NOT IN (${keepCatIds.join(',')})
      `);
      await client.query(`
        DELETE FROM "ak_layanan_categories" 
        WHERE "id" NOT IN (${keepCatIds.join(',')})
      `);
    } else {
      // If none found, delete everything so we start clean
      await client.query('DELETE FROM "ak_layanan"');
      await client.query('DELETE FROM "ak_layanan_categories"');
    }

    console.log('Cleared old services & categories.');

    // 3. Ensure "Skrining Tumbuh Kembang" Category & Service exists
    let catTumbuhKembangId;
    const findTkCat = await client.query(`SELECT id FROM "ak_layanan_categories" WHERE slug = 'tumbuh-kembang' OR slug = 'skrining-tumbuh-kembang' LIMIT 1`);
    if (findTkCat.rows.length > 0) {
      catTumbuhKembangId = findTkCat.rows[0].id;
    } else {
      const ins = await client.query(`
        INSERT INTO "ak_layanan_categories" ("name", "slug", "icon", "sort_order", "created_at", "updated_at")
        VALUES ('Skrining Tumbuh Kembang', 'tumbuh-kembang', '📋', 1, NOW(), NOW())
        RETURNING id
      `);
      catTumbuhKembangId = ins.rows[0].id;
    }

    // Ensure the service under Tumbuh Kembang exists
    const findTkLayanan = await client.query(`SELECT id FROM "ak_layanan" WHERE slug = 'tumbuh-kembang' OR slug = 'skrining-tumbuh-kembang' LIMIT 1`);
    if (findTkLayanan.rows.length === 0) {
      await client.query(`
        INSERT INTO "ak_layanan" (
          "kategori_id", "slug", "title", "description", "image_url", "stats", 
          "mengapa_memilih", "isu_permasalahan", "programs", "is_active", "sort_order", 
          "promo_active", "promo_label", "promo_price", "created_at", "updated_at"
        ) VALUES (
          $1, 'tumbuh-kembang', 'Skrining Tumbuh Kembang', 
          'Deteksi tumbuh kembang anak usia 1-5 tahun secara holistik untuk memantau pencapaian milestone motorik & sosial anak.',
          'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600',
          '{"durasi_sesi": "60 Menit", "format_layanan": "Tatap Muka", "mulai_dari": "Rp 150.000 / Sesi"}'::jsonb,
          '["Evaluasi menyeluruh", "Laporan tertulis", "Rekomendasi tindak lanjut"]'::jsonb,
          '["Pemeriksaan Motorik & Kognitif", "Evaluasi Sosial-Emosional", "Skrining Milestone Tumbuh Kembang"]'::jsonb,
          '[]'::jsonb, true, 1, false, '', '', NOW(), NOW()
        )
      `, [catTumbuhKembangId]);
    }

    // 4. Ensure "Analisis Sidik Jari Bakat" Category & Service exists
    let catBakatId;
    const findBakatCat = await client.query(`SELECT id FROM "ak_layanan_categories" WHERE slug = 'sidik-jari-bakat' OR slug = 'analisis-sidik-jari-bakat' LIMIT 1`);
    if (findBakatCat.rows.length > 0) {
      catBakatId = findBakatCat.rows[0].id;
    } else {
      const ins = await client.query(`
        INSERT INTO "ak_layanan_categories" ("name", "slug", "icon", "sort_order", "created_at", "updated_at")
        VALUES ('Analisis Sidik Jari Bakat', 'sidik-jari-bakat', '🧬', 2, NOW(), NOW())
        RETURNING id
      `);
      catBakatId = ins.rows[0].id;
    }

    // Ensure the service under Sidik Jari Bakat exists
    const findBakatLayanan = await client.query(`SELECT id FROM "ak_layanan" WHERE slug = 'sidik-jari-bakat' OR slug = 'analisis-sidik-jari-bakat' LIMIT 1`);
    if (findBakatLayanan.rows.length === 0) {
      await client.query(`
        INSERT INTO "ak_layanan" (
          "kategori_id", "slug", "title", "description", "image_url", "stats", 
          "mengapa_memilih", "isu_permasalahan", "programs", "is_active", "sort_order", 
          "promo_active", "promo_label", "promo_price", "created_at", "updated_at"
        ) VALUES (
          $1, 'sidik-jari-bakat', 'Analisis Sidik Jari Bakat', 
          'Pemetaan kecerdasan majemuk, potensi bakat alami, serta gaya belajar dominan anak melalui pola sidik jari.',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600',
          '{"durasi_sesi": "60 Menit", "format_layanan": "Tatap Muka", "mulai_dari": "Rp 350.000 / Sesi"}'::jsonb,
          '["Akurasi tinggi berbasis biometrik", "Konsultasi hasil dengan praktisi", "Rekomendasi gaya belajar"]'::jsonb,
          '["Test Bakat Sidik Jari Allia Kids", "Pemetaan Gaya Belajar (V-A-K)", "Konseling Bakat Bawaan Lahir"]'::jsonb,
          '[]'::jsonb, true, 2, false, '', '', NOW(), NOW()
        )
      `, [catBakatId]);
    }

    // 5. Create "Terapi Khusus" Category for the new photo layout
    const insKhususCat = await client.query(`
      INSERT INTO "ak_layanan_categories" ("name", "slug", "icon", "sort_order", "created_at", "updated_at")
      VALUES ('Terapi Khusus', 'terapi-khusus', '🧠', 3, NOW(), NOW())
      RETURNING id
    `);
    const catKhususId = insKhususCat.rows[0].id;

    // Service 5.1: Terapi Takut Nasi
    const takutNasiPrograms = [
      {
        title: "Paket Perilaku 8 Sesi + Nasi 6 Sesi",
        desc: "Paket terapi perilaku komprehensif 8 sesi ditambah 6 sesi pembiasaan makan nasi.",
        harga: "Rp 3.500.000"
      },
      {
        title: "Paket Perilaku 4 Sesi + Nasi 6 Sesi",
        desc: "Paket terapi perilaku intensif 4 sesi ditambah 6 sesi pembiasaan makan nasi.",
        harga: "Rp 2.750.000"
      },
      {
        title: "Terapi Takut Nasi",
        desc: "Sesi terapi standar khusus fobia makanan.",
        harga: "Rp 1.750.000"
      }
    ];

    await client.query(`
      INSERT INTO "ak_layanan" (
        "kategori_id", "slug", "title", "description", "image_url", "stats", 
        "mengapa_memilih", "isu_permasalahan", "programs", "is_active", "sort_order", 
        "promo_active", "promo_label", "promo_price", "created_at", "updated_at"
      ) VALUES (
        $1, 'terapi-takut-nasi', 'Terapi Takut Nasi (Fobia Nasi)', 
        'Program pendampingan terapi perilaku terstruktur khusus untuk mengatasi fobia makanan (takut nasi) secara menyenangkan, aman, dan tanpa tekanan bagi anak.',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600',
        '{"durasi_sesi": "60 Menit", "format_layanan": "Tatap Muka", "mulai_dari": "Rp 3.500.000 / Paket"}'::jsonb,
        '["Sesi terapi privat & personal", "Pendekatan relaksasi klinis ramah anak", "Melibatkan orang tua secara aktif", "Laporan progres berkala"]'::jsonb,
        '["Fobia Makan Nasi", "Trauma Makanan", "Sensory Feeding Issue", "Picky Eater Ekstrem"]'::jsonb,
        $2::jsonb, true, 3, true, 'Diskon 50%', 'Rp 1.750.000 / Paket', NOW(), NOW()
      )
    `, [catKhususId, JSON.stringify(takutNasiPrograms)]);

    // Service 5.2: Terapi Wicara & Perilaku
    const wicaraPrograms = [
      {
        title: "Paket Terapi Perilaku 8 Sesi + Terapi Wicara",
        desc: "Paket komprehensif terapi perilaku 8 sesi digabung dengan sesi terapi wicara.",
        harga: "Rp 3.500.000"
      },
      {
        title: "Paket Terapi Perilaku 4 Sesi + Terapi Wicara",
        desc: "Paket intensif terapi perilaku 4 sesi digabung dengan sesi terapi wicara.",
        harga: "Rp 2.750.000"
      },
      {
        title: "Terapi Wicara",
        desc: "Sesi terapi wicara standar.",
        harga: "Rp 1.750.000"
      },
      {
        title: "Terapi Perilaku",
        desc: "Sesi terapi perilaku standar.",
        harga: "Rp 1.750.000"
      }
    ];

    await client.query(`
      INSERT INTO "ak_layanan" (
        "kategori_id", "slug", "title", "description", "image_url", "stats", 
        "mengapa_memilih", "isu_permasalahan", "programs", "is_active", "sort_order", 
        "promo_active", "promo_label", "promo_price", "created_at", "updated_at"
      ) VALUES (
        $1, 'terapi-wicara-perilaku', 'Terapi Wicara & Perilaku', 
        'Pendampingan komprehensif stimulasi artikulasi bicara, penanganan speech delay (keterlambatan bicara), dan pembiasaan modifikasi perilaku fokus anak.',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
        '{"durasi_sesi": "60 Menit", "format_layanan": "Tatap Muka", "mulai_dari": "Rp 3.500.000 / Paket"}'::jsonb,
        '["Terapis praktisi berpengalaman", "Metode belajar interaktif", "Checklist milestone perkembangan", "Pendekatan ramah anak"]'::jsonb,
        '["Speech Delay", "Keterlambatan Bicara", "Gangguan Artikulasi", "Tantrum Berlebih", "Fokus & Kepatuhan"]'::jsonb,
        $2::jsonb, true, 4, true, 'Diskon 50%', 'Rp 1.750.000 / Paket', NOW(), NOW()
      )
    `, [catKhususId, JSON.stringify(wicaraPrograms)]);

    await client.query('COMMIT');
    console.log('Database successfully seeded!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

main();
