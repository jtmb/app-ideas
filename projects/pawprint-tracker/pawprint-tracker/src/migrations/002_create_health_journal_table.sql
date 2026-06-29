-- Migration: Create health journal table for tracking symptoms and observations
-- Description: Stores pet health entries including symptoms, observations, and notes
-- Date: 2026-01-15

-- Drop table if exists (for re-migration)
DROP TABLE IF EXISTS health_journal CASCADE;

-- Create health journal table
CREATE TABLE health_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('symptom', 'observation', 'note')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    symptom VARCHAR(100),
    severity SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on pet_id for efficient lookups by pet
CREATE INDEX idx_health_journal_pet_id ON health_journal(pet_id);

-- Create index on entry_type for filtering by type
CREATE INDEX idx_health_journal_entry_type ON health_journal(entry_type);

-- Create composite index for date range queries with pet filter
CREATE INDEX idx_health_journal_pet_created_at ON health_journal(pet_id, created_at DESC);

-- Create GIN index for JSONB tags search
CREATE INDEX idx_health_journal_tags ON health_journal USING GIN(tags);

-- Create trigger to update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_health_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_journal_update_timestamp
    BEFORE UPDATE ON health_journal
    FOR EACH ROW
    EXECUTE FUNCTION update_health_journal_updated_at();

-- Add comment to table
COMMENT ON TABLE health_journal IS 'Stores health journal entries for pets including symptoms, observations, and notes';

-- Add comments to columns
COMMENT ON COLUMN health_journal.entry_type IS 'Type of entry: symptom (health issue), observation (behavioral/physical change), note (general health record)';
COMMENT ON COLUMN health_journal.severity IS 'Severity level from 1-5 where 5 is most severe';
COMMENT ON COLUMN health_journal.tags IS 'Array of tags for categorization and filtering';

-- Grant permissions (adjust based on your user setup)
GRANT SELECT, INSERT, UPDATE, DELETE ON health_journal TO authenticated;