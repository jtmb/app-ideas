/**
 * StudySession Model
 * Implements the StudySession entity with database operations
 */

import { StudySession, StudySessionSchema } from '../types';

// ============================================================================
// Type Guards
// ============================================================================

export const isStudySession = (obj: unknown): obj is StudySession => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'userId' in obj &&
    'subjectId' in obj &&
    'startTime' in obj &&
    'durationMinutes' in obj
  );
};

// ============================================================================
// Model Factory
// ============================================================================

export class StudySessionModel {
  /**
   * Create a new StudySession instance from raw data.
   */
  static create(data: StudySessionCreateInput): StudySessionSchema {
    return {
      id: this.generateId(),
      user_id: data.userId,
      subject_id: data.subjectId,
      start_time: data.startTime,
      end_time: data.endTime ?? null,
      duration_minutes: data.durationMinutes,
      notes: data.notes ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Create a StudySession instance from database row.
   */
  static fromRow(row: StudySessionSchema): StudySession {
    return {
      id: row.id,
      userId: row.user_id,
      subjectId: row.subject_id,
      startTime: row.start_time,
      endTime: row.end_time ?? undefined,
      durationMinutes: row.duration_minutes,
      notes: row.notes ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Generate a unique ID for StudySession.
   */
  private static generateId(): string {
    return `ss_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Calculate duration in minutes from start and end times.
   */
  static calculateDuration(start: Date, end?: Date): number {
    if (!end) return 0;
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  /**
   * Validate StudySession data before creation.
   */
  static validate(data: StudySessionCreateInput): void {
    if (!data.userId) {
      throw new Error('userId is required');
    }
    if (!data.subjectId) {
      throw new Error('subjectId is required');
    }
    if (!data.startTime) {
      throw new Error('startTime is required');
    }
    if (data.durationMinutes <= 0) {
      throw new Error('durationMinutes must be greater than 0');
    }
    if (data.endTime && data.endTime < data.startTime) {
      throw new Error('endTime cannot be before startTime');
    }
  }

  /**
   * Update StudySession with partial data.
   */
  static update(
    existing: StudySessionSchema,
    updates: StudySessionUpdateInput
  ): StudySessionSchema {
    return {
      ...existing,
      end_time: updates.endTime ?? existing.end_time,
      duration_minutes: updates.durationMinutes ?? existing.duration_minutes,
      notes: updates.notes ?? existing.notes,
      updated_at: new Date(),
    };
  }
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  StudySession,
  StudySessionSchema,
  StudySessionCreateInput,
  StudySessionUpdateInput,
};
