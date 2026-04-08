const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
      try {
          const envPath = path.resolve(__dirname, '../../.env');
          if (fs.existsSync(envPath)) {
              const env = fs.readFileSync(envPath, 'utf8');
              const match = env.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
              if (match) connectionString = match[1];
          }
      } catch (e) { console.error('Could not read .env file'); }
  }

  if (!connectionString) {
      console.error('DATABASE_URL not found in environment or .env file.');
      process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database.');

    // --- Flows Table ---
    console.log('Checking automation_flows table...');
    await client.query(`
      ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS remote_id text;
      ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]';
      ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS endpoint_uri text;
      ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS is_endpoint_enabled boolean DEFAULT false;
    `);
    console.log('Flows table updated.');

    // --- Contacts Table ---
    console.log('Checking contacts table...');
    await client.query(`
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country_code text;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS groups jsonb DEFAULT '[]';
    `);
    console.log('Contacts table updated.');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
