import { StudyGoal } from '../models/study-goal.model';
import { QueryResult } from 'pg';

/**
 * Service for managing study goals operations
 */
class StudyGoalService {
  private tableName = 'study_goals';

  /**
   * Get all study goals for a user
   */
  async getAllStudyGoals(userId: string): Promise<StudyGoal[]> {
    const query = `
      SELECT 
        id,
        title,
        description,
        target_duration_minutes,
        actual_duration_minutes,
        completion_percentage,
        status,
        subject_id,
        created_at,
        updated_at
      FROM ${this.tableName}
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.executeQuery(query, [userId]);
    
    return result.rows.map(row => this.mapToStudyGoal(row));
  }

  /**
   * Get a single study goal by ID
   */
  async getStudyGoalById(id: string, userId: string): Promise<StudyGoal | null> {
    const query = `
      SELECT 
        id,
        title,
        description,
        target_duration_minutes,
        actual_duration_minutes,
        completion_percentage,
        status,
        subject_id,
        created_at,
        updated_at
      FROM ${this.tableName}
      WHERE id = $1 AND user_id = $2
    `;

    const result = await this.executeQuery(query, [id, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('NOT_FOUND');
    }
    
    return this.mapToStudyGoal(result.rows[0]);
  }

  /**
   * Execute a query and return results
   */
  private async executeQuery(query: string, params: any[]): Promise<QueryResult> {
    const client = await this.getClient();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Get a database client
   */
  private async getClient() {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    return pool;
  }

  /**
   * Map database row to StudyGoal model
   */
  private mapToStudyGoal(row: any): StudyGoal {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      targetDurationMinutes: row.target_duration_minutes,
      actualDurationMinutes: row.actual_duration_minutes,
      completionPercentage: row.completion_percentage,
      status: row.status,
      subjectId: row.subject_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export default StudyGoalService;
