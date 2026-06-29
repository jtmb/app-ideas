-- Migration: 003_create_assets_table.sql
-- Description: Create assets table for media files (images, videos, audio)

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT,
  s3_key VARCHAR(500) NOT NULL,
  s3_bucket VARCHAR(255) DEFAULT 'creativestudio-assets',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  thumbnail_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_file_type ON assets(file_type);
CREATE INDEX idx_assets_mime_type ON assets(mime_type);
CREATE INDEX idx_assets_created_at ON assets(created_at);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE assets IS 'Media files stored in AWS S3 with metadata';
COMMENT ON COLUMN assets.file_type IS 'Type: image, video, audio, document';
COMMENT ON COLUMN assets.s3_key IS 'S3 object key for file retrieval';
COMMENT ON COLUMN assets.metadata IS 'Additional JSONB metadata (EXIF, tags, etc.)';
COMMENT ON COLUMN assets.is_favorite IS 'User favorite flag';
COMMENT ON COLUMN assets.deleted_at IS 'Soft delete timestamp';