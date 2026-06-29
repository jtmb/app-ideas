import { describe, it, expect, beforeEach } from '@jest/globals';
import { calculateNextReview, calculateReviewSchedule, getDueReviews } from '../services/review.service';
import type { StudySessionWithReviews, Review, QualityRating } from '../types';

describe('Spaced Repetition Service', () => {
  describe('calculateNextReview', () => {
    it('should calculate next review for a new session with no history', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [],
      };

      const result = calculateNextReview(session);

      expect(result).toBeDefined();
      expect(result.interval).toBe(1); // initial interval in days
      expect(result.difficultyRating).toBe('good'); // default quality rating of 3
      expect(result.qualityRating).toBe(3);
      expect(result.nextReviewDate).toBeGreaterThan(new Date());
      expect(result.easeFactor).toBe(2.5);
    });

    it('should increase interval for good performance (rating 4)', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [
          {
            nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            interval: 1,
            difficultyRating: 'good',
            qualityRating: 4,
            easeFactor: 2.5,
          },
        ],
      };

      const result = calculateNextReview(session);

      expect(result.interval).toBe(3); // 1 * 2.5 = 2.5, rounded to 3
      expect(result.difficultyRating).toBe('good');
      expect(result.qualityRating).toBe(4);
      expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
    });

    it('should increase interval for excellent performance (rating 5)', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [
          {
            nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            interval: 1,
            difficultyRating: 'good',
            qualityRating: 5,
            easeFactor: 2.5,
          },
        ],
      };

      const result = calculateNextReview(session);

      expect(result.interval).toBe(3); // 1 * 2.5 = 2.5, rounded to 3
      expect(result.difficultyRating).toBe('easy');
      expect(result.qualityRating).toBe(5);
    });

    it('should reset interval for hard performance (rating 3)', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [
          {
            nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            interval: 3,
            difficultyRating: 'good',
            qualityRating: 3,
            easeFactor: 2.5,
          },
        ],
      };

      const result = calculateNextReview(session);

      expect(result.interval).toBe(1); // reset to initial interval
      expect(result.difficultyRating).toBe('hard');
      expect(result.qualityRating).toBe(3);
    });

    it('should reset interval for failed performance (rating 2)', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [
          {
            nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            interval: 3,
            difficultyRating: 'good',
            qualityRating: 2,
            easeFactor: 2.5,
          },
        ],
      };

      const result = calculateNextReview(session);

      expect(result.interval).toBe(1); // reset to initial interval
      expect(result.difficultyRating).toBe('failed');
      expect(result.qualityRating).toBe(2);
    });

    it('should respect minimum interval of 1 day', () => {
      const session: StudySessionWithReviews = {
        id: 'session-1',
        userId: 'user-1',
        subjectId: 'subject-1',
        startTime: new Date(),
        durationMinutes: 60,
        reviews: [
          {
            nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            interval: 1,
            difficultyRating: 'good',
            qualityRating: 4,
            easeFactor: 2.5,
          },
        ],
      };

      const result = calculateNextReview(session);

      expect(result.interval).toBeGreaterThanOrEqual(1);
    });
  });
});