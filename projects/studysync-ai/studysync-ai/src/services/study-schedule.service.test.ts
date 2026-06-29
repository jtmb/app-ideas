import { generateStudySchedule } from './study-schedule.service';
import { Subject, StudySession } from '../types';

describe('generateStudySchedule', () => {
  const subjects: Subject[] = [
    { id: '1', name: 'Mathematics', difficulty: 5 },
    { id: '2', name: 'History', difficulty: 3 },
    { id: '3', name: 'Science', difficulty: 4 },
  ];

  it('returns empty array when energy level is too low', () => {
    const result = generateStudySchedule({
      energyLevel: 2,
      subjects,
      totalMinutes: 180,
    });
    expect(result).toEqual([]);
  });

  it('distributes time evenly across subjects with high energy', () => {
    const result = generateStudySchedule({
      energyLevel: 9,
      subjects,
      totalMinutes: 120,
    });
    
    expect(result.length).toBe(3);
    expect(result[0].subjectName).toBe('Mathematics');
    expect(result[0].duration).toBeGreaterThanOrEqual(35);
    expect(result[0].duration).toBeLessThanOrEqual(45);
  });

  it('prioritizes high difficulty subjects when energy is high', () => {
    const result = generateStudySchedule({
      energyLevel: 8,
      subjects,
      totalMinutes: 60,
    });
    
    expect(result[0].subjectName).toBe('Mathematics');
    expect(result[1].subjectName).toBe('Science');
    expect(result[2].subjectName).toBe('History');
  });

  it('reduces session duration for high difficulty with low energy', () => {
    const result = generateStudySchedule({
      energyLevel: 3,
      subjects,
      totalMinutes: 180,
    });
    
    expect(result.length).toBe(3);
    expect(result[0].duration).toBeLessThan(45);
  });

  it('handles single subject correctly', () => {
    const singleSubject: Subject[] = [{ id: '1', name: 'Math', difficulty: 4 }];
    const result = generateStudySchedule({
      energyLevel: 7,
      subjects: singleSubject,
      totalMinutes: 90,
    });
    
    expect(result.length).toBe(1);
    expect(result[0].duration).toBe(90);
  });

  it('handles zero total minutes', () => {
    const result = generateStudySchedule({
      energyLevel: 8,
      subjects,
      totalMinutes: 0,
    });
    
    expect(result.length).toBe(0);
  });

  it('respects remaining time when not enough for all subjects', () => {
    const result = generateStudySchedule({
      energyLevel: 5,
      subjects,
      totalMinutes: 10,
    });
    
    expect(result.length).toBeLessThanOrEqual(3);
    if (result.length > 0) {
      expect(result[result.length - 1].duration).toBeLessThan(10);
    }
  });

  it('returns StudySession objects with correct structure', () => {
    const result = generateStudySchedule({
      energyLevel: 6,
      subjects,
      totalMinutes: 60,
    });
    
    expect(result).toBeInstanceOf(Array);
    if (result.length > 0) {
      const session = result[0];
      expect(session.subjectId).toBeDefined();
      expect(session.subjectName).toBeDefined();
      expect(session.duration).toBeDefined();
      expect(session.estimatedCompletion).toBeInstanceOf(Date);
    }
  });
});