-- Seed data for users table

INSERT INTO users (email, password_hash, full_name) VALUES
    ('test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxF.0qpI.', 'Test User'),
    ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxF.0qpI.', 'Admin User')
;
