import { Pool } from 'pg';
import config from '../config';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

class UserModel {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: config.postgres.maxPoolSize,
      min: config.postgres.minPoolSize,
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, name, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE email = $1
    `;
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   */
  async create(input: CreateUserInput): Promise<User> {
    const query = `
      INSERT INTO users (email, name, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, email, name, created_at as createdAt, updated_at as updatedAt
    `;
    const result = await this.pool.query(query, [
      input.email,
      input.name,
      input.password, // In production, hash the password before storing
    ]);
    return result.rows[0];
  }

  /**
   * Update user
   */
  async update(id: number, input: UpdateUserInput): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.email) {
      updates.push('email = $1');
      values.push(input.email);
    }
    if (input.name) {
      updates.push('name = $1');
      values.push(input.name);
    }
    if (input.password) {
      updates.push('password_hash = $1');
      values.push(input.password); // In production, hash the password before storing
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, name, created_at as createdAt, updated_at as updatedAt
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete user by ID
   */
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== 0;
  }

  /**
   * Get all users (paginated)
   */
  async findAll(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM users';
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated users
    const query = `
      SELECT id, email, name, created_at as createdAt, updated_at as updatedAt
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.pool.query(query, [limit, offset]);

    return {
      users: result.rows,
      total,
    };
  }
}

export default new UserModel();