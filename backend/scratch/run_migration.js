const { Client } = require('pg');

const client = new Client({
  host: '46.250.235.11',
  port: 35432,
  user: 'postgres',
  password: 'alexandria20',
  database: 'alliakids',
});

async function main() {
  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');
  
  try {
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='ak_banners' AND column_name='mobile_image_url';
    `);
    
    if (res.rows.length === 0) {
      console.log('Column mobile_image_url does not exist. Adding it...');
      await client.query('ALTER TABLE "ak_banners" ADD COLUMN "mobile_image_url" character varying(255);');
      console.log('Column mobile_image_url added successfully!');
    } else {
      console.log('Column mobile_image_url already exists.');
    }
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

main();
