const { Client } = require('pg');

async function checkDb(dbName) {
  const client = new Client({
    host: '46.250.235.11',
    port: 35432,
    user: 'postgres',
    password: 'alexandria20',
    database: dbName,
  });

  try {
    await client.connect();
    console.log(`\nChecking database: ${dbName}...`);
    
    // Check if table ak_banners exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ak_banners'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`- Table 'ak_banners' exists: ${tableExists}`);
    
    if (tableExists) {
      // Get all columns of ak_banners
      const colCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ak_banners';
      `);
      console.log(`- Columns in 'ak_banners':`);
      colCheck.rows.forEach(row => {
        console.log(`  * ${row.column_name} (${row.data_type})`);
      });
    }
  } catch (err) {
    console.log(`- Failed to check database ${dbName}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  // Check the two candidate database names
  await checkDb('alliakids');
  await checkDb('alliakids_db');
}

main();
