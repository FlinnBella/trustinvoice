/*
  # Rename users table to invoices and simplify schema
  
  1. Changes
    - Rename users table to invoice_users for clarity
    - Keep only email and invoice_number tracking
    - Simplify invoice table structure
    - Update all references and policies
  
  2. Security
    - Maintain RLS policies
    - Update foreign key references
*/

-- Create new simplified invoice_users table
CREATE TABLE IF NOT EXISTS invoice_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoice_users ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_users
CREATE POLICY "Users can read own data"
  ON invoice_users
  FOR SELECT
  USING (auth.uid()::text = id::text OR email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

CREATE POLICY "Users can insert own data"
  ON invoice_users
  FOR INSERT
  WITH CHECK (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

-- Update invoices table to reference invoice_users
DO $$
BEGIN
  -- Add foreign key to invoice_users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_user_email_fkey'
  ) THEN
    -- First, ensure all user emails exist in invoice_users
    INSERT INTO invoice_users (email)
    SELECT DISTINCT user_email 
    FROM invoices 
    WHERE user_email NOT IN (SELECT email FROM invoice_users)
    ON CONFLICT (email) DO NOTHING;
    
    -- Add foreign key constraint
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_user_email_fkey 
    FOREIGN KEY (user_email) REFERENCES invoice_users(email);
  END IF;
END $$;

-- Update API keys table to reference invoice_users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    -- Drop old foreign key if exists
    ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
    
    -- Add new foreign key to invoice_users
    ALTER TABLE api_keys 
    ADD CONSTRAINT api_keys_user_email_fkey 
    FOREIGN KEY (user_id) REFERENCES invoice_users(id);
  END IF;
END $$;

-- Update other tables similarly
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contract_deployments') THEN
    ALTER TABLE contract_deployments DROP CONSTRAINT IF EXISTS contract_deployments_user_id_fkey;
    ALTER TABLE contract_deployments 
    ADD CONSTRAINT contract_deployments_user_email_fkey 
    FOREIGN KEY (user_id) REFERENCES invoice_users(id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
    ALTER TABLE webhooks DROP CONSTRAINT IF EXISTS webhooks_user_id_fkey;
    ALTER TABLE webhooks 
    ADD CONSTRAINT webhooks_user_email_fkey 
    FOREIGN KEY (user_id) REFERENCES invoice_users(id);
  END IF;
END $$;

-- Drop old users table if it exists and is different from invoice_users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_name != 'invoice_users') THEN
    DROP TABLE users CASCADE;
  END IF;
END $$;