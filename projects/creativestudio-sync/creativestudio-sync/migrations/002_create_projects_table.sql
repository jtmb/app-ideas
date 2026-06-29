-- Migration: 002_create_projects_table.sql
-- Description: Create projects table for creative studio projects

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  visibility VARCHAR(20) DEFAULT 'private',
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  parent_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);

COMMENT ON TABLE projects IS 'Creative studio project metadata';
COMMENT ON COLUMN projects.status IS 'Status: draft, active, archived, published';
COMMENT ON COLUMN projects.visibility IS 'Visibility: private, team, public';
COMMENT ON COLUMN projects.template_id IS 'Reference to parent template project';
COMMENT ON COLUMN projects.parent_project_id IS 'Parent project for hierarchical structure';