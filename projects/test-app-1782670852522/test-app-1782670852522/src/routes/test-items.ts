import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'better-sqlite3';
import path from 'path';

const router = Router();

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'test.db');
const ensureDir = (dir: string) => {
  try { require('fs').mkdirSync(dir, { recursive: true }); } catch (_e) {}
};
ensureDir(path.dirname(dbPath));

const db = sqlite3(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`CREATE TABLE IF NOT EXISTS test_items (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  value INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`);
db.exec('CREATE INDEX IF NOT EXISTS idx_test_items_id ON test_items(id)');

interface TestItem {
  id: string; name: string; description?: string; value?: number; isActive?: boolean; createdAt: string;
}

function validateCreateItem(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof body !== 'object' || body === null) return { valid: false, errors: ['Request body must be an object'] };
  
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name is required and cannot be empty');
  }
  
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.trim() === '') {
      errors.push('description must be a non-empty string');
    }
  }
  
  if (body.value !== undefined && body.value !== null) {
    const numValue = Number(body.value);
    if (!Number.isFinite(numValue)) {
      errors.push('value must be a valid finite number');
    } else if (numValue < 0 || numValue > Number.MAX_SAFE_INTEGER) {
      errors.push('value must be between 0 and MAX_SAFE_INTEGER');
    }
  }
  
  if (body.isActive !== undefined && body.isActive !== null) {
    if (typeof body.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

router.post('/', (_req: Request, res: Response) => {
  const validation = validateCreateItem(_req.body);
  if (!validation.valid) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Validation failed: ${validation.errors.join(', ')}` } });
    return;
  }
  
  const { name, description, value, isActive } = _req.body;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const is_active = isActive !== undefined ? (isActive ? 1 : 0) : 1;
  const itemValue = value !== undefined && value !== null ? Math.floor(Number(value)) : 0;
  
  try {
    db.prepare(`INSERT INTO test_items (id, name, description, value, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, name, description || null, itemValue, is_active, createdAt, createdAt);
    const newItem: TestItem = { id, name, description: description || '', value: itemValue, isActive: is_active === 1, createdAt };
    res.status(201).json({ success: true, data: newItem });
  } catch (_err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create test item' } });
  }
});

router.get('/:id', (_req: Request, res: Response) => {
  const id = _req.params.id;
  try {
    const stmt = db.prepare(`SELECT id, name, description, value, is_active, created_at, updated_at FROM test_items WHERE id = ?`);
    const row = stmt.get(id);
    if (!row) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: `Test item with id "${id}" not found` } });
      return;
    }
    const item: TestItem = { id: row.id, name: row.name, description: row.description || '', value: row.value || 0, isActive: row.is_active === 1, createdAt: row.created_at };
    res.status(200).json({ success: true, data: item });
  } catch (_err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch test item' } });
  }
});

router.get('/', (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`SELECT id, name, description, value, is_active, created_at, updated_at FROM test_items ORDER BY created_at DESC`);
    const rows = stmt.all();
    const items: TestItem[] = rows.map((row) => ({ id: row.id, name: row.name, description: row.description || '', value: row.value || 0, isActive: row.is_active === 1, createdAt: row.created_at }));
    res.status(200).json({ success: true, data: items });
  } catch (_err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch test items' } });
  }
});

router.delete('/:id', (_req: Request, res: Response) => {
  const id = _req.params.id;
  try {
    const stmt = db.prepare(`DELETE FROM test_items WHERE id = ?`);
    const result = stmt.run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: `Test item with id "${id}" not found` } });
      return;
    }
    res.status(204).send();
  } catch (_err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete test item' } });
  }
});

export default router;
