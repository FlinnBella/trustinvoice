/*
  # Email Tracking and Logging Schema
  
  1. New Tables
    - `email_logs` - Main email tracking table
    - `email_events` - Detailed event tracking (opens, clicks, etc.)
  
  2. Functions
    - RPC functions for incrementing counters
  
  3. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text UNIQUE, -- Resend email ID
  type text NOT NULL, -- invoice_created, payment_received, etc.
  recipient text NOT NULL,
  sender text NOT NULL,
  invoice_number text,
  status text DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, complained, failed
  plan text DEFAULT 'basic',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  
  -- Counters
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  
  -- Error handling
  error_message text,
  bounce_reason text,
  
  -- Metadata
  user_agent text,
  ip_address text
);

-- Email events table for detailed tracking
CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text NOT NULL,
  event_type text NOT NULL, -- opened, clicked, bounced, complained
  timestamp timestamptz DEFAULT now(),
  
  -- Event-specific data
  url text, -- for click events
  user_agent text,
  ip_address text,
  bounce_type text,
  bounce_reason text,
  
  -- Foreign key reference
  FOREIGN KEY (email_id) REFERENCES email_logs(email_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_email_id ON email_logs(email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_invoice_number ON email_logs(invoice_number);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);

-- RPC functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_open_count(email_id text)
RETURNS void AS $$
BEGIN
  UPDATE email_logs 
  SET open_count = open_count + 1 
  WHERE email_logs.email_id = increment_open_count.email_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_click_count(email_id text)
RETURNS void AS $$
BEGIN
  UPDATE email_logs 
  SET click_count = click_count + 1 
  WHERE email_logs.email_id = increment_click_count.email_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policies for email_logs
CREATE POLICY "Users can view own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (sender = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

CREATE POLICY "Service role can manage all email logs"
  ON email_logs
  FOR ALL
  TO service_role
  USING (true);

-- Policies for email_events
CREATE POLICY "Users can view own email events"
  ON email_events
  FOR SELECT
  TO authenticated
  USING (
    email_id IN (
      SELECT email_logs.email_id 
      FROM email_logs 
      WHERE sender = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    )
  );

CREATE POLICY "Service role can manage all email events"
  ON email_events
  FOR ALL
  TO service_role
  USING (true);

-- Add plan column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'plan'
  ) THEN
    ALTER TABLE users ADD COLUMN plan text DEFAULT 'basic';
    ALTER TABLE users ADD CONSTRAINT users_plan_check 
      CHECK (plan IN ('basic', 'pro', 'premium'));
  END IF;
END $$;