-- Migration: 003_create_vaccination_records_table.sql
-- Description: Create the vaccination_records table with foreign key to pets

CREATE TABLE IF NOT EXISTS vaccination_records (
    id SERIAL PRIMARY KEY,
    
    -- Reference to pet (one-to-many relationship)
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- Vaccination details
    vaccine_name VARCHAR(100) NOT NULL,
    date_administered DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(255),
    
    -- Additional information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_vaccination_records_pet_id ON vaccination_records(pet_id);
CREATE INDEX idx_vaccination_records_date_administered ON vaccination_records(date_administered DESC);
CREATE INDEX idx_vaccination_records_next_due_date ON vaccination_records(next_due_date);

-- Composite index for finding upcoming vaccinations
CREATE INDEX idx_vaccination_records_upcoming ON vaccination_records(pet_id, next_due_date) 
    WHERE next_due_date IS NOT NULL;