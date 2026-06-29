-- Migration: Create vaccinations table
-- Description: Stores vaccination records for pets including vaccine details, administration dates, and due dates

CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(255) NOT NULL,
  date_administered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  next_due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for common query patterns
  INDEX idx_vaccinations_pet_id (pet_id),
  INDEX idx_vaccinations_date_administered (date_administered),
  INDEX idx_vaccinations_next_due_date (next_due_date),
  INDEX idx_vaccinations_status (status)
);

-- Create index on composite key for vaccination history queries
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_date ON vaccinations(pet_id, date_administered DESC);