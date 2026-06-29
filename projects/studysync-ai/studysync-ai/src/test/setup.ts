import '@testing-library/jest-dom';

// Set test environment variables before any tests run
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/studysync_test_db';