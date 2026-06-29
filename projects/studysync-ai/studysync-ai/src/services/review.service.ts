import { StudySessionWithReviews, Review } from '../types';

/**
 * Spaced repetition algorithm parameters (SM-2 variant)
 */
const SPACED_REPETITION_PARAMS = {
  initialInterval: 1, // days
  easeFactor: 2.5, // typical range: 2.0 - 3.0
  minimumInterval: 1, // days
};

/**
 * Calculate the next review date and difficulty rating for a study session
 * using a spaced repetition algorithm (SM-2 variant).
 * 
 * @param session - The study session with its review history
 * @returns Object containing next review date, difficulty rating, and interval
 */
export function calculateNextReview(session: StudySessionWithReviews): Review {
  // Get the current quality rating (default to initial if no reviews)
  const lastReview = session.reviews[session.reviews.length - 1];
  const qualityRating = lastReview ? lastReview.qualityRating : 3; // default to 'good'

  // Calculate new interval based on SM-2 algorithm
  let newInterval: number;
  if (qualityRating <= 3) {
    // Failed or hard - reset to initial interval
    newInterval = SPACED_REPETITION_PARAMS.initialInterval;
  } else {
    // Success - increase interval exponentially
    newInterval = Math.round(
      lastReview.interval * SPACED_REPETITION_PARAMS.easeFactor
    );
    // Ensure minimum interval is respected
    newInterval = Math.max(newInterval, SPACED_REPETITION_PARAMS.minimumInterval);
  }

  // Calculate next review date
  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  // Determine difficulty rating based on quality and interval growth
  let difficultyRating: 'easy' | 'good' | 'hard' | 'failed';
  if (qualityRating === 5) {
    difficultyRating = 'easy';
  } else if (qualityRating >= 4) {
    difficultyRating = 'good';
  } else if (qualityRating === 3) {
    difficultyRating = 'hard';
  } else {
    difficultyRating = 'failed';
  }

  // Calculate ease factor adjustment (slightly increase on good ratings)
  let newEaseFactor = SPACED_REPETITION_PARAMS.easeFactor;
  if (qualityRating >= 4) {
    newEaseFactor += 0.05; // small boost for good performance
  } else if (qualityRating <= 3) {
    newEaseFactor -= 0.15; // penalty for poor performance
  }
  // Clamp ease factor to reasonable range
  newEaseFactor = Math.max(1.3, Math.min(newEaseFactor, 3.5));

  return {
    nextReviewDate,
    interval: newInterval,
    difficultyRating,
    qualityRating,
    easeFactor: newEaseFactor,
  };
}

/**
 * Calculate the optimal review schedule for all study sessions
 * 
 * @param sessions - Array of study sessions to schedule
 * @returns Array of scheduled reviews sorted by date
 */
export function calculateReviewSchedule(
  sessions: StudySessionWithReviews[]
): Review[] {
  return sessions
    .map((session) => calculateNextReview(session))
    .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
}

/**
 * Get reviews that are due within the next N days
 * 
 * @param sessions - Array of study sessions
 * @param daysAhead - Number of days to look ahead (default: 7)
 * @returns Array of review objects for due sessions
 */
export function getDueReviews(
  sessions: StudySessionWithReviews[],
  daysAhead: number = 7
): Review[] {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return calculateReviewSchedule(sessions).filter(
    (review) => review.nextReviewDate <= cutoffDate
  );
}