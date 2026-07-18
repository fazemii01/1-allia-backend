const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse .env manually to ensure 100% exact connection values
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const client = new Client({
  host: env.DATABASE_HOST,
  port: parseInt(env.DATABASE_PORT, 10),
  user: env.DATABASE_USER,
  password: env.DATABASE_PASS,
  database: env.DATABASE_NAME,
});

async function main() {
  console.log(`Connecting to ${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME} using env credentials...`);
  await client.connect();
  console.log('Connected!');

  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ak_banners';
    `);
    console.log("Current columns of 'ak_banners':");
    res.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await client.end();
  }
}

main();
