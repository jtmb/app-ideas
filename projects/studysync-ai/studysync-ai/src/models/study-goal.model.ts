/**
 * StudyGoal model representing a study goal entity
 */
export interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  targetDurationMinutes: number;
  actualDurationMinutes?: number;
  completionPercentage?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  subjectId?: string;
  createdAt: Date;
  updatedAt: Date;
}
