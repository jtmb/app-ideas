import { Request, Response } from 'express';
import { Subject } from '../models/subject.model';
import { getDbConnection } from '../database/postgres';

/**
 * GET /api/v1/subjects
 * Retrieves all subjects with optional filtering and pagination
 */
export async function getAllSubjects(req: Request, res: Response): Promise<void> {
  try {
    const connection = await getDbConnection();
    const { search, status } = req.query;

    let query = `
      SELECT 
        id, name, description, status, color, order_index, created_at, updated_at
      FROM subjects
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND name ILIKE $' + (params.length + 1);
      params.push(`%${search as string}%`);
    }

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status as string);
    }

    query += ' ORDER BY order_index ASC, name ASC';

    const results = await connection.query(query, params);

    res.json({
      success: true,
      data: results.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        color: row.color,
        orderIndex: parseInt(row.order_index),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      })),
      count: results.rows.length,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch subjects',
      },
    });
  }
}

/**
 * GET /api/v1/subjects/:id
 * Retrieves a single subject by ID
 */
export async function getSubjectById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const connection = await getDbConnection();

    const query = `
      SELECT 
        id, name, description, status, color, order_index, created_at, updated_at
      FROM subjects
      WHERE id = $1
    `;
    const params = [id];

    const result = await connection.query(query, params);

    if (result.rows.length === 0) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Subject not found',
        },
      });
      return;
    }

    const subject = result.rows[0];

    res.json({
      success: true,
      data: {
        id: subject.id,
        name: subject.name,
        description: subject.description,
        status: subject.status,
        color: subject.color,
        orderIndex: parseInt(subject.order_index),
        createdAt: new Date(subject.created_at).toISOString(),
        updatedAt: new Date(subject.updated_at).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch subject',
      },
    });
  }
}