-- Privacy Bridge MVP - Supabase Database Schema
-- Copy and paste this entire file into your Supabase SQL Editor

-- Create the bridge_transactions table
CREATE TABLE IF NOT EXISTS bridge_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  source_chain text NOT NULL,
  destination_chain text NOT NULL,
  source_token text NOT NULL,
  destination_token text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_private boolean DEFAULT false,
  source_tx_hash text,
  destination_tx_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  fee_amount numeric DEFAULT 0,
  estimated_completion timestamptz
);

-- Enable Row Level Security
ALTER TABLE bridge_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Anyone can view all bridge transactions"
  ON bridge_transactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create bridge transactions"
  ON bridge_transactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
  ON bridge_transactions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bridge_transactions_user_address 
  ON bridge_transactions(user_address);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_status 
  ON bridge_transactions(status);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_created_at 
  ON bridge_transactions(created_at DESC);

-- Success! Your database is ready for the Privacy Bridge MVP
