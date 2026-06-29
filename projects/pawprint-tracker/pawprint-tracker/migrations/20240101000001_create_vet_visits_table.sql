-- Migration: Create vet_visits table with foreign key to pets
-- Description: Stores veterinary visit records linked to pet profiles

CREATE TABLE IF NOT EXISTS vet_visits (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on pet_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_vet_visits_pet_id ON vet_visits(pet_id);

-- Create index on visit_date for date range queries
CREATE INDEX IF NOT EXISTS idx_vet_visits_visit_date ON vet_visits(visit_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vet_visits_updated_at ON vet_visits;
CREATE TRIGGER update_vet_visits_updated_at
    BEFORE UPDATE ON vet_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();