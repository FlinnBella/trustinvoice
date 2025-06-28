/*
  # Create invoices table for TrustInvoice

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `user_email` (text, not null)
      - `recipient_email` (text, not null)
      - `amount` (decimal, not null)
      - `description` (text)
      - `due_date` (date)
      - `invoice_number` (text, unique)
      - `company_name` (text)
      - `company_address` (text)
      - `items` (jsonb for invoice items)
      - `status` (text, default 'draft')
      - `pdf_url` (text)
      - `smart_contract_address` (text)
      - `blockchain_tx_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `invoices` table
    - Add policy for users to read/write their own invoices
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  recipient_email text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  description text DEFAULT '',
  due_date date,
  invoice_number text UNIQUE NOT NULL,
  company_name text DEFAULT '',
  company_address text DEFAULT '',
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  pdf_url text,
  smart_contract_address text,
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own invoices"
  ON invoices
  FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own invoices"
  ON invoices
  FOR UPDATE
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create storage bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice-pdfs', 'invoice-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Users can upload invoice PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'invoice-pdfs');

CREATE POLICY "Users can view invoice PDFs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'invoice-pdfs');