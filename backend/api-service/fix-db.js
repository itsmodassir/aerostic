const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
      try {
          // Check both root and parent directory for .env
          const paths = [
              path.resolve(__dirname, '../../.env'),
              path.resolve(__dirname, '../.env')
          ];
          for (const envPath of paths) {
              if (fs.existsSync(envPath)) {
                  const env = fs.readFileSync(envPath, 'utf8');
                  const match = env.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
                  if (match) {
                      connectionString = match[1];
                      console.log(`Using credentials from: ${envPath}`);
                      break;
                  }
              }
          }
      } catch (e) { console.error('Could not read .env file'); }
  }

  if (!connectionString) {
      console.error('DATABASE_URL not found in environment or .env file.');
      process.exit(1);
  }

  // Robust configuration to avoid SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
  const config = { connectionString };
  
  // Only add password if explicitly provided as a non-empty string in env
  if (process.env.DB_PASSWORD) {
    config.password = String(process.env.DB_PASSWORD);
  } else {
    // If no DB_PASSWORD in env, check if connectionString has it. 
    // If not, explicitly set to undefined or empty string to see if pg likes it better.
    // Actually, setting it to an empty string '' is safest for pg when it expects a string.
    config.password = ''; 
  }

  const client = new Client(config);

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

    // --- Plans Table ---
    console.log('Checking plans table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text,
        price numeric(10, 2) NOT NULL DEFAULT 0,
        currency text NOT NULL DEFAULT 'INR',
        interval text NOT NULL DEFAULT 'monthly',
        features jsonb DEFAULT '[]',
        limits jsonb DEFAULT '{}',
        is_active boolean DEFAULT true,
        "createdAt" timestamp with time zone DEFAULT now(),
        "updatedAt" timestamp with time zone DEFAULT now()
      );
    `);

    // Seed default plans if they don't exist
    const plansCount = await client.query('SELECT count(*) FROM plans');
    if (parseInt(plansCount.rows[0].count) === 0) {
      console.log('Seeding default plans...');
      await client.query(`
        INSERT INTO plans (name, slug, description, price, features, limits)
        VALUES 
          ('Free', 'free', 'Free tier for small tests', 0, '["Bulk SMS", "Basic Chatbot", "Single Agent"]', '{"monthlyMessages": 100, "aiCredits": 10, "maxAgents": 1}'),
          ('Starter', 'starter', 'Best for startups', 1999, '["50,000 Messages", "AI Chatbot", "Cloud Hosting", "Dedicated Support"]', '{"monthlyMessages": 50000, "aiCredits": 1000, "maxAgents": 2}'),
          ('Growth', 'growth', 'Best for growing businesses', 4999, '["200,000 Messages", "Advanced AI", "Webhooks & API", "Priority Support"]', '{"monthlyMessages": 200000, "aiCredits": 5000, "maxAgents": 5}'),
          ('Enterprise', 'enterprise', 'Best for large scale ops', 14999, '["Unlimited Messages", "Custom AI Models", "Full API Access", "Account Manager"]', '{"monthlyMessages": 999999, "aiCredits": 999999, "maxAgents": 999}');
      `);
      console.log('Default plans seeded.');
    } else {
        console.log('Plans table already has data.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
