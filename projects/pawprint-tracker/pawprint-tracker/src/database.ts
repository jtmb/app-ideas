// ============================================================================
// PawPrint Tracker - Database Connection & Configuration
// ============================================================================

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * PostgreSQL connection configuration
 */
const poolConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DATABASE || 'pawprint_tracker',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * PostgreSQL connection pool instance
 */
export const pool = new Pool(poolConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get a single database client for a query
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Query the database with proper error handling
 */
export async function query<T>(text: string, params?: unknown[]): Promise<T> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    console.log(`Query executed in ${Date.now() - start}ms`);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction with proper cleanup
 */
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Graceful shutdown handler
 */
export async function closeConnection(): Promise<void> {
  await pool.end();
  console.log('Database connection closed');
}

// Export types for TypeScript
export type { Pool, PoolClient } from 'pg';