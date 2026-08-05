/**
 * WhatsApp Template Seeding & Trigger Test Script
 * Target Parent Phone Number: 082123581796
 * 
 * Usage:
 *   node scripts/test-wa-templates.js
 *   or
 *   npx tsx scripts/test-wa-templates.js
 */

const BASE_URL = process.env.API_BASE_URL || 'https://backend.alliakids.com/api';
const TARGET_PHONE = '082123581796';

const TEMPLATE_TEST_CASES = [
  {
    trigger_event: 'apply_created',
    name: 'Konfirmasi Pendaftaran',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      jenis_terapi: 'Terapi Wicara',
    },
  },
  {
    trigger_event: 'invoice_created',
    name: 'Tagihan Invoice',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      invoice_number: 'INV-202608-001',
      total_amount: '350.000',
      layanan: 'Paket Terapi Wicara 4 Sesi',
      due_date: '10 Agustus 2026',
    },
  },
  {
    trigger_event: 'session_reminder',
    name: 'Pengingat Jadwal Sesi',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      jenis_terapi: 'Terapi Wicara',
      tanggal_sesi: 'Rabu, 5 Agustus 2026',
      jam_sesi: '14:00 WIB',
      nama_terapis: 'Siti Rahma, S.Tr.Kes',
    },
  },
  {
    trigger_event: 'payment_received',
    name: 'Konfirmasi Pembayaran',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      invoice_number: 'INV-202608-001',
      total_amount: '350.000',
    },
  },
];

async function runTest() {
  console.log('================================================================');
  console.log('🚀 TESTING WHATSAPP TEMPLATE TRIGGERS & SEEDING DATA');
  console.log(`📱 Target Parent Phone Number : ${TARGET_PHONE}`);
  console.log(`🌐 Backend Endpoint           : ${BASE_URL}/admin/whatsapp/trigger-test`);
  console.log('================================================================\n');

  const results = [];

  for (const testCase of TEMPLATE_TEST_CASES) {
    console.log(`🔄 Triggering template [${testCase.trigger_event}] (${testCase.name})...`);

    try {
      const res = await fetch(`${BASE_URL}/admin/whatsapp/trigger-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trigger_event: testCase.trigger_event,
          phone: TARGET_PHONE,
          vars: testCase.vars,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.sent) {
        console.log(`  ✅ SUCCESS: Sent [${testCase.trigger_event}] via WaSender\n`);
        results.push({
          Trigger: testCase.trigger_event,
          Template: testCase.name,
          Status: 'SENT ✅',
          Message: 'Message dispatched successfully',
        });
      } else {
        const err = data?.error || data?.message || `HTTP ${res.status}`;
        console.log(`  ⚠️ FAILED/LOGGED: [${testCase.trigger_event}] - ${err}\n`);
        results.push({
          Trigger: testCase.trigger_event,
          Template: testCase.name,
          Status: 'LOGGED/FAILED ⚠️',
          Message: err,
        });
      }
    } catch (err) {
      console.log(`  ❌ ERROR: Connection failed - ${err.message}\n`);
      results.push({
        Trigger: testCase.trigger_event,
        Template: testCase.name,
        Status: 'ERROR ❌',
        Message: err.message,
      });
    }
  }

  console.log('================================================================');
  console.log('📊 TEST SUMMARY RESULTS:');
  console.table(results);
  console.log('================================================================');
}

runTest();
