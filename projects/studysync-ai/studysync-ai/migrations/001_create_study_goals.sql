-- Migration: 001_create_study_goals.sql
-- Description: Create study_goals table with foreign keys to users and subjects
-- Date: 2026-06-29

CREATE TABLE IF NOT EXISTS study_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN (daily, weekly, monthly)),
    target_value INTEGER NOT NULL,
    actual_value INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT active CHECK (status IN (active, completed, overdue, cancelled)),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query optimization
CREATE INDEX idx_study_goals_user_id ON study_goals(user_id);
CREATE INDEX idx_study_goals_subject_id ON study_goals(subject_id);
CREATE INDEX idx_study_goals_status ON study_goals(status);
CREATE INDEX idx_study_goals_start_date ON study_goals(start_date);
CREATE INDEX idx_study_goals_goal_type ON study_goals(goal_type);

-- Composite index for common query patterns
CREATE INDEX idx_study_goals_user_subject ON study_goals(user_id, subject_id);
