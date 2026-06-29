-- Migration: 004_create_comments_table.sql
-- Description: Create comments table for collaborative feedback on projects and assets

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_asset_id ON comments(asset_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_resolved ON comments(is_resolved) WHERE is_resolved = false;

COMMENT ON TABLE comments IS 'Collaborative comments for feedback and discussion';
COMMENT ON COLUMN comments.parent_comment_id IS 'Reference to parent comment for threading';
COMMENT ON COLUMN comments.is_resolved IS 'Flag for resolved/answered comments';
COMMENT ON COLUMN comments.resolved_by_id IS 'User who marked comment as resolved';