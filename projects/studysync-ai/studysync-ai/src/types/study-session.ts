/**
 * Study Session type definition
 */
export interface StudySession {
  id: string;
  subjectId: number | null;
  subjectName: string | null;
  duration: number; // Planned duration in minutes
  actualDuration: number | null; // Actual duration in minutes (null if not completed)
  notes: string | null;
  status: StudySessionStatus;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Study session status enumeration
 */
export type StudySessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
