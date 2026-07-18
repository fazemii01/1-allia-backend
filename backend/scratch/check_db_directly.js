const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  let env = {};
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts[1].trim();
      }
    });
  } catch (e) {
    console.error('Could not read .env file:', e.message);
    return;
  }

  const client = new Client({
    host: env.DATABASE_HOST,
    port: parseInt(env.DATABASE_PORT, 10),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASS,
    database: env.DATABASE_NAME,
  });

  try {
    await client.connect();
    console.log(`Connected to database at ${env.DATABASE_HOST}`);
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='ak_banners';
    `);
    console.log('Columns currently in ak_banners table:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await client.end();
  }
}

main();
