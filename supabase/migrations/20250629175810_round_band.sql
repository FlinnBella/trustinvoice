/*
  # Add user plan and API management tables

  1. New Tables
    - Add plan column to users table
    - `api_keys` table for API key management
    - `api_usage` table for rate limiting
    - `contract_deployments` table for tracking deployments
    - `webhooks` table for webhook management

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Add plan column to users table (assuming users table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'plan'
  ) THEN
    -- Create users table if it doesn't exist
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Add plan column
    ALTER TABLE users ADD COLUMN plan text DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'premium'));
    ALTER TABLE users ADD COLUMN plan_expires_at timestamptz;
    ALTER TABLE users ADD COLUMN stripe_customer_id text;
    ALTER TABLE users ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  key_hash text UNIQUE NOT NULL,
  name text NOT NULL,
  permissions text[] DEFAULT '{}',
  rate_limit integer DEFAULT 100,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL,
  endpoint text,
  created_at timestamptz DEFAULT now()
);

-- Contract Deployments tracking
CREATE TABLE IF NOT EXISTS contract_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  contract_type text NOT NULL,
  contract_address text NOT NULL,
  transaction_hash text NOT NULL,
  network text NOT NULL,
  parameters jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  gas_used bigint,
  gas_price bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text,
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- API Keys policies
CREATE POLICY "Users can manage own API keys"
  ON api_keys
  FOR ALL
  USING (user_id = auth.uid());

-- API Usage policies (admin only for reading)
CREATE POLICY "Users can view own API usage"
  ON api_usage
  FOR SELECT
  USING (
    key_hash IN (
      SELECT key_hash FROM api_keys WHERE user_id = auth.uid()
    )
  );

-- Contract Deployments policies
CREATE POLICY "Users can view own deployments"
  ON contract_deployments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create deployments"
  ON contract_deployments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Webhooks policies
CREATE POLICY "Users can manage own webhooks"
  ON webhooks
  FOR ALL
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_hash ON api_usage(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_contract_deployments_user_id ON contract_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);

-- Function to increment API usage count
CREATE OR REPLACE FUNCTION increment_usage(key_hash text)
RETURNS void AS $$
BEGIN
  UPDATE api_keys 
  SET usage_count = usage_count + 1 
  WHERE api_keys.key_hash = increment_usage.key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old API usage records (run daily)
CREATE OR REPLACE FUNCTION cleanup_api_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM api_usage 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;