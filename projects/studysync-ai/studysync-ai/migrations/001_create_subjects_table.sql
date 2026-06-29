-- Migration: Create subjects table with indexes on name and category

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on name for fast lookups by subject name
CREATE INDEX idx_subjects_name ON subjects(name);

-- Index on category for filtering by study category
CREATE INDEX idx_subjects_category ON subjects(category) WHERE category IS NOT NULL;
