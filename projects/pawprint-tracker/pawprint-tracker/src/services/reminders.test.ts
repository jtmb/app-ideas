import { describe, it, expect } from 'vitest';
import { calculateNextVaccinationDate, calculateNextAppointmentDate, calculateMedicationReminder, ReminderType } from './reminders';

describe('Reminder Calculation Logic', () => {
  describe('calculateNextVaccinationDate', () => {
    it('should calculate next date for annual vaccination', () => {
      const lastDate = new Date('2024-01-15');
      const result = calculateNextVaccinationDate(lastDate, ReminderType.VACCINATION, 365);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
    });

    it('should handle leap years correctly', () => {
      const lastDate = new Date('2024-02-29');
      const result = calculateNextVaccinationDate(lastDate, ReminderType.VACCINATION, 365);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
    });

    it('should handle invalid last date', () => {
      const result = calculateNextVaccinationDate(null as any, ReminderType.VACCINATION, 365);
      expect(result).toBeNull();
    });

    it('should handle negative interval', () => {
      const lastDate = new Date('2024-01-15');
      const result = calculateNextVaccinationDate(lastDate, ReminderType.VACCINATION, -365);
      expect(result).toBeNull();
    });
  });

  describe('calculateNextAppointmentDate', () => {
    it('should calculate appointment for specific date', () => {
      const scheduledDate = new Date('2025-03-15');
      const result = calculateNextAppointmentDate(scheduledDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(scheduledDate.getTime());
    });

    it('should handle invalid date', () => {
      const result = calculateNextAppointmentDate(null as any);
      expect(result).toBeNull();
    });
  });

  describe('calculateMedicationReminder', () => {
    it('should calculate daily medication reminder', () => {
      const lastTaken = new Date('2024-01-15T10:00:00Z');
      const result = calculateMedicationReminder(lastTaken, ReminderType.MEDICATION, 24 * 60 * 60 * 1000);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle invalid last taken date', () => {
      const result = calculateMedicationReminder(null as any, ReminderType.MEDICATION, 86400000);
      expect(result).toBeNull();
    });

    it('should handle negative interval', () => {
      const lastTaken = new Date('2024-01-15');
      const result = calculateMedicationReminder(lastTaken, ReminderType.MEDICATION, -86400000);
      expect(result).toBeNull();
    });
  });

  describe('ReminderType enum', () => {
    it('should have correct values', () => {
      expect(ReminderType.VACCINATION).toBe('vaccination');
      expect(ReminderType.APPOINTMENT).toBe('appointment');
      expect(ReminderType.MEDICATION).toBe('medication');
    });
  });
});