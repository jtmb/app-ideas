-- Migration: 001_create_pets_table.sql
-- Description: Create the pets table with all core fields and indexes for pet health tracking

CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'reptile', 'small_mammal', 'other')),
    breed VARCHAR(100),
    age_months INTEGER DEFAULT 0,
    gender VARCHAR(20),
    color VARCHAR(100),
    weight_kg DECIMAL(5,2),
    
    -- Owner relationship (one pet has one owner)
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    
    -- Contact information
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Medical identifiers
    microchip_id VARCHAR(50),
    rabies_tag_id VARCHAR(50),
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_is_active ON pets(is_active);
CREATE INDEX idx_pets_created_at ON pets(created_at DESC);

-- Partial index for active pets (common filter)
CREATE INDEX idx_pets_active ON pets(id, owner_id) WHERE is_active = TRUE;

-- Composite index for searching by species and status
CREATE INDEX idx_pets_species_status ON pets(species, is_active);

-- GIN index for full-text search on pet details (optional, can be added later if needed)
-- CREATE INDEX idx_pets_fts ON pets USING GIN(to_tsvector('english', name || ' ' || breed || ' ' || color));