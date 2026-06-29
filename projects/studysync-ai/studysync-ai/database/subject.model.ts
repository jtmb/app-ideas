import { Subject, DifficultyLevel, Category, createSubject } from '../types/subject';
import { Pool } from 'pg';

export interface SubjectRow extends Subject {
  id: string;
  name: string;
  difficulty_level: DifficultyLevel;
  category: Category;
  estimated_study_time_per_week: number;
  created_at: Date;
  updated_at: Date;
}

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) throw new Error('Database pool not initialized');
  return pool;
}

export async function initializeSubjectModel(connectionString: string): Promise<void> {
  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  pool.on('connect', (client) => client.query('SET statement_timeout TO 5000'));
  console.log('Subject model initialized');
}

export async function closeSubjectModel(): Promise<void> {
  if (pool) { await pool.end(); pool = null; }
}

export async function createSubjectInDatabase(data: { name: string; difficultyLevel: DifficultyLevel; category: Category; estimatedStudyTimePerWeek: number }): Promise<Subject> {
  const client = await getPool().connect();
  try { await client.query('BEGIN');
    const result = await client.query('INSERT INTO subjects (name, difficulty_level, category, estimated_study_time_per_week) VALUES ($1, $2, $3, $4) RETURNING *', [data.name, data.difficultyLevel, data.category, data.estimatedStudyTimePerWeek]);
    const row = result.rows[0];
    return createSubject({ name: row.name, difficultyLevel: row.difficulty_level as DifficultyLevel, category: row.category as Category, estimatedStudyTimePerWeek: row.estimated_study_time_per_week });
  } finally { client.release(); }
}

export async function findSubjectById(id: string): Promise<Subject | null> {
  const client = await getPool().connect();
  try { const result = await client.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return createSubject({ name: row.name, difficultyLevel: row.difficulty_level as DifficultyLevel, category: row.category as Category, estimatedStudyTimePerWeek: row.estimated_study_time_per_week });
  } finally { client.release(); }
}

export async function findAllSubjects(filters?: { category?: Category; difficultyLevel?: DifficultyLevel }): Promise<Subject[]> {
  const client = await getPool().connect();
  try {
    let query = 'SELECT * FROM subjects';
    const values: unknown[] = [];
    if (filters?.category) { query += ' WHERE category = $1'; values.push(filters.category); }
    else if (filters?.difficultyLevel) { query += ' WHERE difficulty_level = $1'; values.push(filters.difficultyLevel); }
    query += ' ORDER BY name ASC';
    const result = await client.query(query, values);
    return result.rows.map((row) => createSubject({ name: row.name, difficultyLevel: row.difficulty_level as DifficultyLevel, category: row.category as Category, estimatedStudyTimePerWeek: row.estimated_study_time_per_week }));
  } finally { client.release(); }
}

export async function updateSubjectInDatabase(id: string, updates: Partial<{ name?: string; difficultyLevel?: DifficultyLevel; category?: Category; estimatedStudyTimePerWeek?: number }>): Promise<Subject | null> {
  const client = await getPool().connect();
  try { await client.query('BEGIN');
    const existing = await client.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    const fields: string[] = [];
    const values: unknown[] = [];
    if (updates.name !== undefined) { fields.push('name = $1'); values.push(updates.name); }
    if (updates.difficultyLevel !== undefined) { fields.push('difficulty_level = $2'); values.push(updates.difficultyLevel); }
    if (updates.category !== undefined) { fields.push('category = $3'); values.push(updates.category); }
    if (updates.estimatedStudyTimePerWeek !== undefined) { fields.push('estimated_study_time_per_week = $4'); values.push(updates.estimatedStudyTimePerWeek); }
    if (fields.length === 0) return existing.rows[0] as unknown as Subject;
    values.push(id);
    await client.query(`UPDATE subjects SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1`, values);
    const result = await client.query('SELECT * FROM subjects WHERE id = $1', [id]);
    return createSubject({ name: result.rows[0].name, difficultyLevel: result.rows[0].difficulty_level as DifficultyLevel, category: result.rows[0].category as Category, estimatedStudyTimePerWeek: result.rows[0].estimated_study_time_per_week });
  } finally { client.release(); }
}

export async function deleteSubjectById(id: string): Promise<boolean> {
  const client = await getPool().connect();
  try { await client.query('BEGIN');
    const result = await client.query('DELETE FROM subjects WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } finally { client.release(); }
}

export async function searchSubjectsByName(query: string): Promise<Subject[]> {
  const escapedQuery = query.replace(/'/g, "''") + '%';
  const client = await getPool().connect();
  try { const result = await client.query('SELECT * FROM subjects WHERE name ILIKE $1 ORDER BY name ASC', [escapedQuery]);
    return result.rows.map((row) => createSubject({ name: row.name, difficultyLevel: row.difficulty_level as DifficultyLevel, category: row.category as Category, estimatedStudyTimePerWeek: row.estimated_study_time_per_week }));
  } finally { client.release(); }
}

export async function getSubjectStatistics(): Promise<{ totalSubjects: number; subjectsByCategory: Record<string, number>; subjectsByDifficulty: Record<string, number>; averageStudyTimePerWeek: number }> {
  const client = await getPool().connect();
  try {
    const totalResult = await client.query('SELECT COUNT(*) as count FROM subjects');
    const categoryResult = await client.query('SELECT category, COUNT(*) as count FROM subjects GROUP BY category');
    const difficultyResult = await client.query('SELECT difficulty_level, COUNT(*) as count FROM subjects GROUP BY difficulty_level');
    const avgResult = await client.query('SELECT AVG(estimated_study_time_per_week) as avg_time FROM subjects');
    return { totalSubjects: parseInt(totalResult.rows[0].count, 10), subjectsByCategory: categoryResult.rows.reduce((a, r) => { a[r.category] = parseInt(r.count, 10); return a; }, {} as Record<string, number>), subjectsByDifficulty: difficultyResult.rows.reduce((a, r) => { a[r.difficulty_level] = parseInt(r.count, 10); return a; }, {} as Record<string, number>), averageStudyTimePerWeek: parseFloat(avgResult.rows[0].avg_time) || 0 };
  } finally { client.release(); }
}

export async function ensureSubjectsTableExists(): Promise<void> {
  const client = await getPool().connect();
  try { await client.query('CREATE TABLE IF NOT EXISTS subjects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN (\'beginner\', \'intermediate\', \'advanced\')), category VARCHAR(50) NOT NULL, estimated_study_time_per_week INTEGER NOT NULL CHECK (estimated_study_time_per_week > 0), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())'); }
  finally { client.release(); }
}

export async function dropSubjectsTable(): Promise<void> {
  const client = await getPool().connect();
  try { await client.query('DROP TABLE IF EXISTS subjects'); }
  finally { client.release(); }
}
