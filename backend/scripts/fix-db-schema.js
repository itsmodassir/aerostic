require('dotenv').config();
const { Client } = require('pg');

async function fixDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add web_search_enabled column to ai_agents
    await client.query(`
      ALTER TABLE ai_agents 
      ADD COLUMN IF NOT EXISTS "web_search_enabled" boolean DEFAULT false;
    `);
    console.log('Ensured web_search_enabled column exists in ai_agents');

    // Add missing columns to audit_logs and rename if needed
    await client.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "actor_type" text,
      ADD COLUMN IF NOT EXISTS "actor_id" text,
      ADD COLUMN IF NOT EXISTS "resource_type" text,
      ADD COLUMN IF NOT EXISTS "resource_id" text,
      ADD COLUMN IF NOT EXISTS "metadata" jsonb,
      ADD COLUMN IF NOT EXISTS "ip_address" text,
      ADD COLUMN IF NOT EXISTS "user_agent" text,
      ADD COLUMN IF NOT EXISTS "hash" text,
      ADD COLUMN IF NOT EXISTS "previous_hash" text,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
    `);
    
    // Rename timestamp to created_at if it exists and created_at doesn't have data
    try {
      await client.query('UPDATE audit_logs SET created_at = timestamp WHERE created_at IS NULL AND timestamp IS NOT NULL');
    } catch (e) { /* ignore if timestamp doesn\\'t exist */ }

    console.log('Ensured all required columns exist in audit_logs (including created_at)');

  } catch (err) {
    console.error('Error fixing db:', err);
  } finally {
    await client.end();
  }
}

fixDb();
