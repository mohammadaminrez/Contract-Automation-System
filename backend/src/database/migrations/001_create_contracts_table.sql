-- Migration: Create contracts table
-- Run this in Supabase SQL Editor or via migration tool

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_type VARCHAR(10) NOT NULL,
  file_size INTEGER,
  original_text TEXT,
  is_analyzed BOOLEAN DEFAULT false,
  extracted_data JSONB,
  payment_schedules JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  extraction_confidence DECIMAL(3,2),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_is_analyzed ON contracts(is_analyzed);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for contract files (optional, can be done via dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

-- Comment for documentation
COMMENT ON TABLE contracts IS 'Stores uploaded rental contracts and their extracted data';
COMMENT ON COLUMN contracts.extracted_data IS 'JSONB field storing extracted contract information (guest, rent, dates, etc.)';
COMMENT ON COLUMN contracts.payment_schedules IS 'JSONB array storing generated payment schedule options';
