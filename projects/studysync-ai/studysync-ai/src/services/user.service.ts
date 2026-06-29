import { createPool } from 'pg';
import { AppError, HttpCode } from '../utils/errors';

const pool = createPool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/studysync_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, bio, avatar_url, timezone, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw new AppError('Failed to fetch user', HttpCode.INTERNAL_SERVER_ERROR);
  }
};

export const updateUser = async (userId: string, updateData: Partial<Pick<User, 'name' | 'email' | 'bio' | 'avatarUrl' | 'timezone'>>): Promise<User> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) { fields.push('name'); values.push(updateData.name); paramIndex++; }
    if (updateData.email !== undefined) { fields.push('email'); values.push(updateData.email.toLowerCase().trim()); paramIndex++; }
    if (updateData.bio !== undefined) { fields.push('bio'); values.push(updateData.bio); paramIndex++; }
    if (updateData.avatarUrl !== undefined) { fields.push('avatar_url'); values.push(updateData.avatarUrl); paramIndex++; }
    if (updateData.timezone !== undefined) { fields.push('timezone'); values.push(updateData.timezone); paramIndex++; }

    fields.push('updated_at');
    values.push();
    paramIndex++;

    if (fields.length === 0) {
      throw new AppError('No valid fields to update', HttpCode.BAD_REQUEST);
    }

    const query = 'UPDATE users SET ' + fields.join(', ') + ' WHERE id = $' + (paramIndex - 1) + ' RETURNING id, name, email, bio, avatar_url, timezone, created_at, updated_at';
    values.push(userId);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new AppError('Failed to update user', HttpCode.INTERNAL_SERVER_ERROR);
  }
};
