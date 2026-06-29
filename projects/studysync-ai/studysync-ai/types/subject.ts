/**
 * Subject entity type definition
 * Represents a subject that users can study (e.g., Mathematics, Physics)
 */

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum Category {
  SCIENCE = 'science',
  MATHEMATICS = 'mathematics',
  HISTORY = 'history',
  LITERATURE = 'literature',
  LANGUAGE = 'language',
  ARTS = 'arts',
  OTHER = 'other'
}

export interface Subject {
  id: string;
  name: string;
  difficultyLevel: DifficultyLevel;
  category: Category;
  estimatedStudyTimePerWeek: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new Subject instance from raw data
 */
export function createSubject(data: {
  name: string;
  difficultyLevel: DifficultyLevel;
  category: Category;
  estimatedStudyTimePerWeek: number;
}): Subject {
  return {
    id: crypto.randomUUID(),
    name: data.name,
    difficultyLevel: data.difficultyLevel,
    category: data.category,
    estimatedStudyTimePerWeek: data.estimatedStudyTimePerWeek,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Update a Subject instance with new data
 */
export function updateSubject(
  subject: Subject,
  updates: Partial<{
    name: string;
    difficultyLevel: DifficultyLevel;
    category: Category;
    estimatedStudyTimePerWeek: number;
  }>
): Subject {
  const updated = { ...subject, ...updates };
  updated.updatedAt = new Date();
  return updated;
}

/**
 * Validate Subject data before creation/update
 */
export function validateSubjectData(data: unknown): data is {
  name: string;
  difficultyLevel: DifficultyLevel;
  category: Category;
  estimatedStudyTimePerWeek: number;
} {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  // Required fields must exist and be non-empty
  if (
    !d.name ||
    typeof d.name !== 'string' ||
    d.name.trim().length === 0
  ) return false;

  if (!d.difficultyLevel) return false;
  if (!Object.values(DifficultyLevel).includes(d.difficultyLevel)) return false;

  if (!d.category) return false;
  if (!Object.values(Category).includes(d.category)) return false;

  // estimatedStudyTimePerWeek must be a positive number
  if (
    typeof d.estimatedStudyTimePerWeek !== 'number' ||
    d.estimatedStudyTimePerWeek <= 0
  ) return false;

  return true;
}