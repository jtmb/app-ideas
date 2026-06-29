/**
 * TypeScript Data Types for StudySync AI
 * Defines all entity interfaces and database types
 */

// ============================================================================
// Base Entity Interface
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// User Entity
// ============================================================================

export interface User extends BaseEntity {
  email: string;
  name: string;
  isActive: boolean;
}

// ============================================================================
// Subject Entity
// ============================================================================

export interface Subject extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  color?: string;
}

// ============================================================================
// StudyGoal Entity
// ============================================================================

/**
 * Represents a study goal for tracking progress toward weekly targets.
 * Links a user to a subject with target hours and deadline.
 */
export interface StudyGoal extends BaseEntity {
  userId: string;
  subjectId: string;
  targetHoursPerWeek: number;
  currentHours: number;
  deadline: Date;
}

// ============================================================================
// StudySession Entity
// ============================================================================

/**
 * Represents a scheduled study session.
 * Tracks when and how long a user studied for a specific subject.
 */
export interface StudySession extends BaseEntity {
  userId: string;
  subjectId: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  notes?: string;
}

// ============================================================================
// Database Schema Types (for PostgreSQL)
// ============================================================================

export interface StudyGoalSchema {
  id: string;
  user_id: string;
  subject_id: string;
  target_hours_per_week: number;
  current_hours: number;
  deadline: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StudySessionSchema {
  id: string;
  user_id: string;
  subject_id: string;
  start_time: Date;
  end_time: Date | null;
  duration_minutes: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface StudyGoalCreateInput {
  userId: string;
  subjectId: string;
  targetHoursPerWeek: number;
  deadline: Date;
}

export interface StudyGoalUpdateInput {
  targetHoursPerWeek?: number;
  currentHours?: number;
  deadline?: Date;
}

export interface PaginatedStudyGoals {
  data: StudyGoal[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StudySessionCreateInput {
  userId: string;
  subjectId: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  notes?: string;
}

export interface StudySessionUpdateInput {
  endTime?: Date;
  durationMinutes?: number;
  notes?: string;
}

export interface PaginatedStudySessions {
  data: StudySession[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Spaced Repetition Types
// ============================================================================

/**
 * Quality rating for a review (1-5 scale)
 */
export type QualityRating = 1 | 2 | 3 | 4 | 5;

/**
 * Difficulty rating based on performance
 */
export type DifficultyRating = 'easy' | 'good' | 'hard' | 'failed';

/**
 * Review record for a study session
 */
export interface Review {
  nextReviewDate: Date;
  interval: number; // days until next review
  difficultyRating: DifficultyRating;
  qualityRating: QualityRating;
  easeFactor: number;
}

/**
 * Study session with subject and review history
 */
export interface StudySessionWithReviews extends BaseEntity {
  userId: string;
  subjectId: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  notes?: string;
  reviews: Review[];
}

/**
 * Study session creation request
 */
export interface CreateStudySessionRequest {
  subjectId: string;
  content?: string;
  tags?: string[];
}

/**
 * Review quality rating request (1-5)
 */
export interface RateReviewRequest {
  qualityRating: QualityRating;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}
