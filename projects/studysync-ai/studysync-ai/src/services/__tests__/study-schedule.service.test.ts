import { describe, test, expect } from 'vitest';
import { generateStudySchedule, isSubjectDueForReview, getNextReviewDate, optimizeScheduleByEnergy } from '../study-schedule.service';

const mockSubjects = [
  {
    id: 'sub-1',
    name: 'Mathematics',
    difficulty: 'hard',
    lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sub-2',
    name: 'History',
    difficulty: 'medium',
    lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sub-3',
    name: 'Biology',
    difficulty: 'easy',
    lastReviewDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'sub-4',
    name: 'Chemistry',
    difficulty: 'hard',
    lastReviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

describe('generateStudySchedule', () => {
  test('should generate schedule with correct number of sessions', () => {
    const studyDate = new Date();
    const sessions = generateStudySchedule(mockSubjects, 'medium', 8, studyDate);
    expect(sessions.length).toBe(4);
  });

  test('should sort subjects by spaced repetition urgency (highest interval first)', () => {
    const studyDate = new Date();
    const sessions = generateStudySchedule(mockSubjects, 'medium', 8, studyDate);
    expect(sessions[0].subjectId).toBe('sub-1');
    expect(sessions[1].subjectId).toBe('sub-2');
    expect(sessions[2].subjectId).toBe('sub-3');
    expect(sessions[3].subjectId).toBe('sub-4');
  });

  test('should apply energy level multiplier to session duration', () => {
    const studyDate = new Date();
    const lowEnergySessions = generateStudySchedule(mockSubjects, 'low', 8, studyDate);
    expect(lowEnergySessions[0].durationMinutes).toBeLessThanOrEqual(19);

    const highEnergySessions = generateStudySchedule(mockSubjects, 'high', 8, studyDate);
    expect(highEnergySessions[0].durationMinutes).toBeGreaterThanOrEqual(38);

    const mediumEnergySessions = generateStudySchedule(mockSubjects, 'medium', 8, studyDate);
    expect(mediumEnergySessions[0].durationMinutes).toBe(25);
  });

  test('should apply difficulty multiplier to session duration', () => {
    const studyDate = new Date();
    const easySession = generateStudySchedule([mockSubjects[2]], 'medium', 8, studyDate)[0];
    expect(easySession.durationMinutes).toBeLessThanOrEqual(19);

    const hardSession = generateStudySchedule([mockSubjects[0]], 'medium', 8, studyDate)[0];
    expect(hardSession.durationMinutes).toBeGreaterThanOrEqual(34);

    const mediumSession = generateStudySchedule([mockSubjects[1]], 'medium', 8, studyDate)[0];
    expect(mediumSession.durationMinutes).toBe(25);
  });

  test('should respect maximum daily sessions limit (6)', () => {
    const manySubjects = [...mockSubjects, ...mockSubjects.map(s => ({
      ...s,
      id: `sub-extra-${s.id.split('-')[1]}`,
      lastReviewDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }))];
    const studyDate = new Date();
    const sessions = generateStudySchedule(manySubjects, 'medium', 8, studyDate);
    expect(sessions.length).toBeLessThanOrEqual(6);
  });

  test('should respect available hours constraint', () => {
    const studyDate = new Date();
    const limitedSessions = generateStudySchedule(mockSubjects, 'medium', 2, studyDate);
    expect(limitedSessions.length).toBeLessThanOrEqual(2);
  });

  test('should calculate optimal duration combining energy and difficulty', () => {
    const studyDate = new Date();
    const lowEasySession = generateStudySchedule([mockSubjects[2]], 'low', 8, studyDate)[0];
    expect(lowEasySession.durationMinutes).toBeLessThanOrEqual(15);

    const highHardSession = generateStudySchedule([mockSubjects[0]], 'high', 8, studyDate)[0];
    expect(highHardSession.durationMinutes).toBeGreaterThanOrEqual(50);
  });

  test('should handle new subjects (no last review date)', () => {
    const newSubject = {
      id: 'sub-new',
      name: 'New Subject',
      difficulty: 'medium',
      lastReviewDate: null,
    };
    const studyDate = new Date();
    const sessions = generateStudySchedule([newSubject], 'medium', 8, studyDate);
    expect(sessions.length).toBe(1);
    expect(sessions[0].subjectId).toBe('sub-new');
    expect(sessions[0].durationMinutes).toBe(25);
  });

  test('should handle empty subjects array', () => {
    const studyDate = new Date();
    const sessions = generateStudySchedule([], 'medium', 8, studyDate);
    expect(sessions.length).toBe(0);
  });
});

describe('isSubjectDueForReview', () => {
  test('should return true for subject due based on spaced repetition interval', () => {
    const subject = {
      id: 'sub-1',
      name: 'Mathematics',
      difficulty: 'hard',
      lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };
    expect(isSubjectDueForReview(subject)).toBe(false);
  });

  test('should return true when subject has exceeded required interval', () => {
    const subject = {
      id: 'sub-1',
      name: 'Mathematics',
      difficulty: 'hard',
      lastReviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };
    expect(isSubjectDueForReview(subject)).toBe(true);
  });

  test('should return true for new subjects (no last review date)', () => {
    const subject = {
      id: 'sub-new',
      name: 'New Subject',
      difficulty: 'medium',
      lastReviewDate: null,
    };
    expect(isSubjectDueForReview(subject)).toBe(true);
  });

  test('should return false for recently reviewed subjects', () => {
    const subject = {
      id: 'sub-1',
      name: 'Mathematics',
      difficulty: 'hard',
      lastReviewDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    };
    expect(isSubjectDueForReview(subject)).toBe(false);
  });
});

describe('getNextReviewDate', () => {
  test('should calculate next review date based on spaced repetition interval', () => {
    const subject = {
      id: 'sub-1',
      name: 'Mathematics',
      difficulty: 'hard',
      lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };
    const nextDate = getNextReviewDate(subject);
    const now = new Date();
    const diffHours = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(47);
    expect(diffHours).toBeLessThan(53);
  });

  test('should return today for new subjects', () => {
    const subject = {
      id: 'sub-new',
      name: 'New Subject',
      difficulty: 'medium',
      lastReviewDate: null,
    };
    const nextDate = getNextReviewDate(subject);
    expect(nextDate).toBeLessThanOrEqual(new Date());
  });

  test('should return appropriate interval for different review ages', () => {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const subjectOneDay = {
      id: 'sub-1',
      name: 'Mathematics',
      difficulty: 'hard',
      lastReviewDate: oneDayAgo,
    };
    const nextDate = getNextReviewDate(subjectOneDay);
    const diffHours = (nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(23);
    expect(diffHours).toBeLessThan(25);
  });
});

describe('optimizeScheduleByEnergy', () => {
  const mockSessions = [
    {
      id: 'session-1',
      userId: '',
      subjectId: 'sub-hard',
      startTime: new Date(),
      endTime: null,
      durationMinutes: 45,
      notes: '',
    },
    {
      id: 'session-2',
      userId: '',
      subjectId: 'sub-easy',
      startTime: new Date(),
      endTime: null,
      durationMinutes: 20,
      notes: '',
    },
    {
      id: 'session-3',
      userId: '',
      subjectId: 'sub-medium',
      startTime: new Date(),
      endTime: null,
      durationMinutes: 25,
      notes: '',
    },
  ];

  test('should order sessions by difficulty when energy is high (hard first)', () => {
    const optimized = optimizeScheduleByEnergy(mockSessions, 'high');
    expect(optimized[0].subjectId).toBe('sub-hard');
    expect(optimized[1].subjectId).toBe('sub-medium');
    expect(optimized[2].subjectId).toBe('sub-easy');
  });

  test('should order sessions by difficulty when energy is low (easy first)', () => {
    const optimized = optimizeScheduleByEnergy(mockSessions, 'low');
    expect(optimized[0].subjectId).toBe('sub-easy');
    expect(optimized[1].subjectId).toBe('sub-medium');
    expect(optimized[2].subjectId).toBe('sub-hard');
  });

  test('should return empty array for empty input', () => {
    const optimized = optimizeScheduleByEnergy([], 'medium');
    expect(optimized.length).toBe(0);
  });

  test('should maintain session properties after optimization', () => {
    const originalSession = mockSessions[0];
    const optimized = optimizeScheduleByEnergy(mockSessions, 'high');
    const optimizedSession = optimized.find(s => s.id === originalSession.id);
    expect(optimizedSession).toBeDefined();
    expect(optimizedSession?.durationMinutes).toBe(originalSession.durationMinutes);
  });
});
