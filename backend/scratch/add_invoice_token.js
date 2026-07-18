const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '46.250.235.11',
    port: 35432,
    user: 'postgres',
    password: 'alexandria20',
    database: 'alliakids',
  });

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function generateToken() {
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Add invoice_token column if not exists
    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='ak_invoices' AND column_name='invoice_token'
    `);

    if (colCheck.rows.length === 0) {
      await client.query(`ALTER TABLE "ak_invoices" ADD COLUMN "invoice_token" varchar(8) UNIQUE`);
      console.log('Column invoice_token added.');
    } else {
      console.log('Column invoice_token already exists.');
    }

    // 2. Backfill existing rows that have no token
    const rows = await client.query(`SELECT id FROM "ak_invoices" WHERE invoice_token IS NULL`);
    console.log(`Found ${rows.rows.length} invoices needing tokens.`);

    for (const row of rows.rows) {
      let token = generateToken();
      // Ensure uniqueness
      let exists = await client.query(`SELECT id FROM "ak_invoices" WHERE invoice_token = $1`, [token]);
      while (exists.rows.length > 0) {
        token = generateToken();
        exists = await client.query(`SELECT id FROM "ak_invoices" WHERE invoice_token = $1`, [token]);
      }
      await client.query(`UPDATE "ak_invoices" SET invoice_token = $1 WHERE id = $2`, [token, row.id]);
      console.log(`  Invoice #${row.id} → token: ${token}`);
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
