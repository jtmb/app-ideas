/**
 * Database Configuration - PostgreSQL connection settings
 */

const { Pool } = require('pg');

// Environment-based configuration with sensible defaults
const config = {
  // Development environment
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'datematch_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },

  // Production environment
  production: {
    host: process.env.DB_HOST || 'datematch-db',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'datematch_prod',
    user: process.env.DB_USER || 'datematch_user',
    password: process.env.DB_PASSWORD || process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || '',
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
      rejectUnauthorized: false
    }
  },

  // Test environment
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'datematch_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000
  }
};

// Get current environment config
const getDbConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env] || config.development;
};

// Create PostgreSQL pool
const pool = new Pool(getDbConfig());

// Handle connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err);
  // In production, you would want to restart the pool or application
});

// Test database connection
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  } finally {
    client.release();
  }
};

// Close all connections
const closePool = async () => {
  await pool.end();
};

module.exports = {
  pool,
  getDbConfig,
  testConnection,
  closePool
};