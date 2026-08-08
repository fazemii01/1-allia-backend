/**
 * WhatsApp Template Trigger Test Script
 *
 * Tests 4 WA trigger events by sending real messages via WaSender to a target phone.
 * Automatically authenticates with the backend first to obtain a JWT token.
 *
 * Usage:
 *   node scripts/test-wa-templates.js
 *
 * Options (via env vars):
 *   API_BASE_URL  - Backend base URL (default: http://localhost:9000/api)
 *   ADMIN_EMAIL   - Admin account email
 *   ADMIN_PASS    - Admin account password
 *   TARGET_PHONE  - Destination WhatsApp number (default: 082123581796)
 */

const BASE_URL    = process.env.API_BASE_URL  || 'https://backend.alliakids.com/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL   || 'admin@alliakids.com';
const ADMIN_PASS  = process.env.ADMIN_PASS    || 'admin123';
const TARGET_PHONE = process.env.TARGET_PHONE || '082123581796';

const TRIGGERS = [
  {
    trigger_event: 'apply_created',
    label: 'Konfirmasi Pendaftaran',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      usia: '5',
      jenis_terapi: 'Terapi Wicara',
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
  },
  {
    trigger_event: 'invoice_created',
    label: 'Tagihan Invoice',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      invoice_number: 'INV-TEST-001',
      total_amount: '350.000',
      layanan: 'Paket Terapi Wicara 4 Sesi',
      due_date: '15 Agustus 2026',
      link_invoice: `${BASE_URL.replace('/api', '')}/invoice/INV-TEST-001`,
    },
  },
  {
    trigger_event: 'session_reminder',
    label: 'Pengingat Jadwal Sesi',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      jenis_terapi: 'Terapi Wicara',
      tanggal_sesi: 'Rabu, 13 Agustus 2026',
      jam_sesi: '14:00 WIB',
      nama_terapis: 'Siti Rahma, S.Tr.Kes',
    },
  },
  {
    trigger_event: 'payment_received',
    label: 'Konfirmasi Pembayaran',
    vars: {
      nama_ortu: 'Ibu Maya',
      nama_anak: 'Ananda Budi',
      invoice_number: 'INV-TEST-001',
      total_amount: '350.000',
    },
  },
];

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error(`Login failed (HTTP ${res.status}): ${data?.message || JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function triggerWA(token, trigger) {
  const res = await fetch(`${BASE_URL}/admin/whatsapp/trigger-test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      trigger_event: trigger.trigger_event,
      phone: TARGET_PHONE,
      vars: trigger.vars,
    }),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

async function run() {
  console.log('='.repeat(66));
  console.log('  ALLIA KIDS - WhatsApp Template Trigger Test');
  console.log('='.repeat(66));
  console.log(`  Backend   : ${BASE_URL}`);
  console.log(`  Admin     : ${ADMIN_EMAIL}`);
  console.log(`  Target WA : ${TARGET_PHONE}`);
  console.log('='.repeat(66));
  console.log();

  let token;
  process.stdout.write('  [AUTH] Logging in as admin... ');
  try {
    token = await login();
    console.log('OK - JWT token acquired');
  } catch (err) {
    console.log('FAILED');
    console.error(`\n  ERROR: ${err.message}`);
    console.log('\n  Tip: Make sure the backend is running and ADMIN_EMAIL/ADMIN_PASS are correct.');
    process.exit(1);
  }

  console.log();

  const results = [];

  for (const trigger of TRIGGERS) {
    process.stdout.write(`  [TRIGGER] ${trigger.trigger_event.padEnd(20)} (${trigger.label})... `);
    try {
      const { ok, status, data } = await triggerWA(token, trigger);
      if (ok && data?.sent) {
        console.log('SENT');
        results.push({ Trigger: trigger.trigger_event, Label: trigger.label, Result: 'SENT', Note: 'Message dispatched via WaSender' });
      } else {
        const note = data?.error || data?.message || `HTTP ${status}`;
        console.log(`WARN - ${note}`);
        results.push({ Trigger: trigger.trigger_event, Label: trigger.label, Result: 'WARN', Note: note });
      }
    } catch (err) {
      console.log(`ERROR - ${err.message}`);
      results.push({ Trigger: trigger.trigger_event, Label: trigger.label, Result: 'ERROR', Note: err.message });
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log();
  console.log('='.repeat(66));
  console.log('  SUMMARY');
  console.log('='.repeat(66));
  console.table(results);

  const sent  = results.filter((r) => r.Result === 'SENT').length;
  const warn  = results.filter((r) => r.Result === 'WARN').length;
  const error = results.filter((r) => r.Result === 'ERROR').length;

  console.log(`\n  Sent: ${sent}  |  Warn: ${warn}  |  Error: ${error}`);
  console.log('='.repeat(66));
}

run();
