import { StudySession, Subject } from '../types';

/**
 * Spaced repetition intervals in hours based on days since last review
 */
const SPACED_REPETITION_INTERVALS: Record<number, number> = {
  0: 1,      // Same day - review again in 1 hour
  1: 24,     // Next day - review in 24 hours
  3: 48,     // 3 days ago - review in 2 days
  7: 72,     // 1 week ago - review in 3 days
  14: 168,   // 2 weeks ago - review in 1 week
  30: 336,   // 1 month ago - review in 2 weeks
};

/**
 * Energy level multipliers for session duration optimization
 */
const ENERGY_MULTIPLIERS: Record<string, number> = {
  low: 0.5,    // Reduce session time by 50%
  medium: 1.0, // Normal session time
  high: 1.5,   // Increase session time by 50%
};

/**
 * Subject difficulty multipliers for session duration optimization
 */
const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 0.75,  // Reduce session time by 25%
  medium: 1.0, // Normal session time
  hard: 1.33,  // Increase session time by 33%
};

/**
 * Base session duration in minutes for new subjects
 */
const BASE_SESSION_DURATION = 25;

/**
 * Maximum sessions per day to prevent burnout
 */
const MAX_DAILY_SESSIONS = 6;

/**
 * Minimum gap between sessions (in hours)
 */
const MIN_SESSION_GAP_HOURS = 1.5;

/**
 * Generates an optimized study schedule using spaced repetition algorithm
 * considering user energy levels and subject difficulty.
 * 
 * @param subjects - Array of subjects to schedule
 * @param userEnergyLevel - Current energy level of the user
 * @param availableHours - Available hours in a day (e.g., 8 for 8am-4pm)
 * @param studyDate - The date for which to generate the schedule
 * @returns Array of optimized study sessions
 */
export function generateStudySchedule(
  subjects: Subject[],
  userEnergyLevel: string,
  availableHours: number,
  studyDate: Date
): StudySession[] {
  const sessions: StudySession[] = [];
  const startHour = 8; // Default start at 8am
  const endHour = startHour + availableHours;

  // Sort subjects by priority (most urgent first based on spaced repetition)
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aInterval = getSpacedRepetitionInterval(a.lastReviewDate);
    const bInterval = getSpacedRepetitionInterval(b.lastReviewDate);
    
    // Higher interval = more urgent (needs review sooner relative to schedule)
    if (bInterval !== aInterval) return bInterval - aInterval;
    
    // If same interval, prioritize by difficulty (harder first)
    const aDifficultyMultiplier = getDifficultyMultiplier(a.difficulty);
    const bDifficultyMultiplier = getDifficultyMultiplier(b.difficulty);
    return bDifficultyMultiplier - aDifficultyMultiplier;
  });

  let currentHour = startHour;

  for (const subject of sortedSubjects) {
    // Check if we've exceeded max daily sessions
    if (sessions.length >= MAX_DAILY_SESSIONS) {
      break;
    }

    // Calculate optimal session duration based on energy and difficulty
    const optimalDuration = calculateOptimalSessionDuration(
      userEnergyLevel,
      subject.difficulty
    );

    // Create study session
    const session: StudySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: '',
      subjectId: subject.id,
      startTime: new Date(studyDate.setHours(currentHour)),
      endTime: null,
      durationMinutes: optimalDuration,
      notes: '',
    };

    sessions.push(session);

    // Move to next slot with minimum gap
    currentHour += (optimalDuration / 60) + MIN_SESSION_GAP_HOURS;

    // Check if we've exceeded available hours
    if (currentHour >= endHour) {
      break;
    }
  }

  return sessions;
}

/**
 * Gets the spaced repetition interval based on days since last review
 */
function getSpacedRepetitionInterval(lastReviewDate: Date | null): number {
  if (!lastReviewDate) {
    return 0; // New subject - treat as reviewed today
  }

  const daysSinceReview = Math.floor(
    (new Date().getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return SPACED_REPETITION_INTERVALS[daysSinceReview] || daysSinceReview * 24;
}

/**
 * Gets the difficulty multiplier for session duration calculation
 */
function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return DIFFICULTY_MULTIPLIERS.easy;
    case 'medium':
      return DIFFICULTY_MULTIPLIERS.medium;
    case 'hard':
      return DIFFICULTY_MULTIPLIERS.hard;
    default:
      return DIFFICULTY_MULTIPLIERS.medium;
  }
}

/**
 * Calculates optimal session duration considering both energy and difficulty
 */
function calculateOptimalSessionDuration(
  energyLevel: string,
  difficulty: string
): number {
  const energyMultiplier = ENERGY_MULTIPLIERS[energyLevel] || 1.0;
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);
  
  let duration = BASE_SESSION_DURATION * energyMultiplier * difficultyMultiplier;

  // Apply minimum session time (15 minutes)
  return Math.max(15, Math.round(duration));
}

/**
 * Checks if a subject is due for review based on spaced repetition algorithm
 */
export function isSubjectDueForReview(subject: Subject): boolean {
  const daysSinceReview = subject.lastReviewDate 
    ? Math.floor((new Date().getTime() - subject.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const requiredInterval = SPACED_REPETITION_INTERVALS[daysSinceReview] || daysSinceReview * 24;
  
  // Subject is due if it's been at least the required interval since last review
  return daysSinceReview >= requiredInterval;
}

/**
 * Calculates the next recommended review date for a subject
 */
export function getNextReviewDate(subject: Subject): Date {
  const daysSinceReview = subject.lastReviewDate 
    ? Math.floor((new Date().getTime() - subject.lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const intervalHours = SPACED_REPETITION_INTERVALS[daysSinceReview] || daysSinceReview * 24;
  
  return new Date(new Date().getTime() + intervalHours * 60 * 1000);
}

/**
 * Optimizes the study schedule by reordering sessions based on current energy levels
 */
export function optimizeScheduleByEnergy(
  sessions: StudySession[],
  userEnergyLevel: string
): StudySession[] {
  if (sessions.length === 0) return [];

  // Sort sessions to place easier subjects when energy is low, harder when high
  const sortedSessions = [...sessions].sort((a, b) => {
    const aDifficultyMultiplier = getDifficultyMultiplier(a.subject.difficulty);
    const bDifficultyMultiplier = getDifficultyMultiplier(b.subject.difficulty);
    
    // If energy is high, put harder subjects first (descending)
    // If energy is low, put easier subjects first (ascending)
    if (userEnergyLevel === 'high') {
      return bDifficultyMultiplier - aDifficultyMultiplier;
    } else if (userEnergyLevel === 'low') {
      return aDifficultyMultiplier - bDifficultyMultiplier;
    }
    
    // Medium energy: default to difficulty order
    return bDifficultyMultiplier - aDifficultyMultiplier;
  });

  return sortedSessions;
}
