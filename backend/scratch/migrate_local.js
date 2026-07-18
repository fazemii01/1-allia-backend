const { Client } = require('pg');

async function runAlter(config, label) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log(`Connected to database: ${label} (${config.host}:${config.port}/${config.database})`);
    
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='ak_banners' AND column_name='mobile_image_url';
    `);
    
    if (res.rows.length === 0) {
      console.log(`- Column mobile_image_url does not exist. Adding to ${label}...`);
      await client.query('ALTER TABLE "ak_banners" ADD COLUMN "mobile_image_url" character varying(255);');
      console.log(`- Added successfully to ${label}!`);
    } else {
      console.log(`- Column mobile_image_url already exists in ${label}.`);
    }
  } catch (err) {
    console.log(`- Failed to update ${label}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  // 1. Try remote database from env
  const fs = require('fs');
  const path = require('path');
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
  } catch (e) {}

  if (env.DATABASE_HOST) {
    await runAlter({
      host: env.DATABASE_HOST,
      port: parseInt(env.DATABASE_PORT, 10),
      user: env.DATABASE_USER,
      password: env.DATABASE_PASS,
      database: env.DATABASE_NAME,
    }, 'Remote Database (from .env)');
  }

  // 2. Try common localhost database configurations (in case NestJS fell back to defaults)
  await runAlter({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'alliakids_db',
  }, 'Local Host Defaults (alliakids_db)');

  await runAlter({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'alliakids',
  }, 'Local Host Defaults (alliakids)');
}

main();
