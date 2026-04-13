-- flows
ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS remote_id text;
ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]';
ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS endpoint_uri text;
ALTER TABLE automation_flows ADD COLUMN IF NOT EXISTS is_endpoint_enabled boolean DEFAULT false;

-- contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS groups jsonb DEFAULT '[]';

-- plans
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

-- Ensure description column exists if table was created previously
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description text;

-- seed
INSERT INTO plans (name, slug, description, price, features, limits)
VALUES 
  ('Free', 'free', 'Free tier for small tests', 0, '["Bulk SMS", "Basic Chatbot", "Single Agent"]', '{"monthlyMessages": 100, "aiCredits": 10, "maxAgents": 1}'),
  ('Starter', 'starter', 'Best for startups', 1999, '["50,000 Messages", "AI Chatbot", "Cloud Hosting", "Dedicated Support"]', '{"monthlyMessages": 50000, "aiCredits": 1000, "maxAgents": 2}'),
  ('Growth', 'growth', 'Best for growing businesses', 4999, '["200,000 Messages", "Advanced AI", "Webhooks & API", "Priority Support"]', '{"monthlyMessages": 200000, "aiCredits": 5000, "maxAgents": 5}'),
  ('Enterprise', 'enterprise', 'Best for large scale ops', 14999, '["Unlimited Messages", "Custom AI Models", "Full API Access", "Account Manager"]', '{"monthlyMessages": 999999, "aiCredits": 999999, "maxAgents": 999}')
ON CONFLICT (slug) DO NOTHING;
