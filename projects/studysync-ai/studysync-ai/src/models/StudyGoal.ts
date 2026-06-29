/**
 * StudyGoal Model
 * Implements the StudyGoal entity with database operations
 */

import { StudyGoal, StudyGoalSchema, StudyGoalCreateInput, StudyGoalUpdateInput } from "../types";

// ============================================================================
// Type Guards
// ============================================================================

export const isStudyGoal = (obj: unknown): obj is StudyGoal => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "userId" in obj &&
    "subjectId" in obj &&
    "targetHoursPerWeek" in obj &&
    "currentHours" in obj &&
    "deadline" in obj
  );
};

// ============================================================================
// Model Factory
// ============================================================================

export class StudyGoalModel {
  /**
   * Create a new StudyGoal instance from raw data.
   */
  static create(data: StudyGoalCreateInput): StudyGoalSchema {
    return {
      id: this.generateId(),
      user_id: data.userId,
      subject_id: data.subjectId,
      target_hours_per_week: data.targetHoursPerWeek,
      current_hours: 0,
      deadline: data.deadline,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Create a StudyGoal instance from database row.
   */
  static fromRow(row: StudyGoalSchema): StudyGoal {
    return {
      id: row.id,
      userId: row.user_id,
      subjectId: row.subject_id,
      targetHoursPerWeek: row.target_hours_per_week,
      currentHours: row.current_hours,
      deadline: row.deadline,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Generate a unique ID for StudyGoal.
   */
  private static generateId(): string {
    return `sg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate StudyGoal data before creation.
   */
  static validate(data: StudyGoalCreateInput): void {
    if (!data.userId) {
      throw new Error("userId is required");
    }
    if (!data.subjectId) {
      throw new Error("subjectId is required");
    }
    if (data.targetHoursPerWeek <= 0) {
      throw new Error("targetHoursPerWeek must be greater than 0");
    }
    if (!data.deadline) {
      throw new Error("deadline is required");
    }
  }

  /**
   * Update StudyGoal with partial data.
   */
  static update(
    existing: StudyGoalSchema,
    updates: StudyGoalUpdateInput
  ): StudyGoalSchema {
    return {
      ...existing,
      target_hours_per_week: updates.targetHoursPerWeek ?? existing.target_hours_per_week,
      current_hours: updates.currentHours ?? existing.current_hours,
      deadline: updates.deadline ?? existing.deadline,
      updated_at: new Date(),
    };
  }

  /**
   * Calculate progress percentage toward weekly target.
   */
  static calculateProgress(goal: StudyGoalSchema): number {
    if (goal.target_hours_per_week === 0) return 0;
    const progress = (goal.current_hours / goal.target_hours_per_week) * 100;
    return Math.min(100, Math.max(0, progress));
  }
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  StudyGoal,
  StudyGoalSchema,
  StudyGoalCreateInput,
  StudyGoalUpdateInput,
};
