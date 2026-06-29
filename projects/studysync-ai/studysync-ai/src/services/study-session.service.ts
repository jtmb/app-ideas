import { QueryTypes } from 'pg';
import { StudySession } from '../types/study-session';

export class StudySessionService {
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.DATABASE_URL || '';
  }

  /**
   * Get all study sessions with pagination and filtering
   */
  async getStudySessions(params: {
    page: number;
    limit: number;
    sortBy: string;
    order: 'asc' | 'desc';
    subjectId?: number;
  }): Promise<[StudySession[], number]> {
    const { page, limit, sortBy, order, subjectId } = params;

    // Validate sort field
    const validSortFields = ['createdAt', 'updatedAt', 'duration', 'subject'];
    if (!validSortFields.includes(sortBy)) {
      throw new Error({ code: 'INVALID_SORT_FIELD', message: `Invalid sort field: ${sortBy}` });
    }

    let query = `
      SELECT 
        ss.id,
        ss.subject_id,
        ss.duration,
        ss.actual_duration,
        ss.notes,
        ss.status,
        ss.created_at as created_at,
        ss.updated_at as updated_at,
        s.name as subject_name
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];
    let offset = (page - 1) * limit;

    if (subjectId !== undefined && subjectId !== null) {
      query += ' AND ss.subject_id = $';
      queryParams.push(subjectId);
      offset++;
    }

    // Order by clause
    const orderField = sortBy === 'subject' ? 's.name' : `ss.${sortBy}`;
    query += ` ORDER BY ${orderField} ${order}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE 1=1
    `;

    const countQueryParams: any[] = [];
    if (subjectId !== undefined && subjectId !== null) {
      countQuery += ' AND ss.subject_id = $';
      countQueryParams.push(subjectId);
    }

    // Execute queries in parallel
    const [sessionsResult, totalResult] = await Promise.all([
      this.executeQuery(query, [...queryParams, limit, offset]),
      this.executeQuery(countQuery, countQueryParams)
    ]);

    const sessions: StudySession[] = sessionsResult.map((row: any) => ({
      id: row.id,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      duration: row.duration,
      actualDuration: row.actual_duration,
      notes: row.notes,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    }));

    const total = parseInt(totalResult.total);

    return [sessions, total];
  }

  /**
   * Get a single study session by ID
   */
  async getStudySessionById(id: string): Promise<StudySession | null> {
    const query = `
      SELECT 
        ss.id,
        ss.subject_id,
        ss.duration,
        ss.actual_duration,
        ss.notes,
        ss.status,
        ss.created_at as created_at,
        ss.updated_at as updated_at,
        s.name as subject_name
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.id = $1
    `;

    const result = await this.executeQuery(query, [id]);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      duration: row.duration,
      actualDuration: row.actual_duration,
      notes: row.notes,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  /**
   * Execute a raw SQL query with parameters
   */
  private async executeQuery(query: string, params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const client = this.getConnection();
      
      client.query(query, params, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.rows);
        }
        client.end();
      });
    });
  }

  /**
   * Get a new PostgreSQL connection
   */
  private getConnection(): any {
    return new (require('pg').Client)({
      connectionString: this.connectionString
    });
  }
}