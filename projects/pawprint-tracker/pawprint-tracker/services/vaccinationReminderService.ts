/**
 * Vaccination Reminder Service
 * Calculates next vaccination due dates and generates alerts
 */

import { VaccinationReminder, Alert, ReminderConfig, ReminderServiceOptions } from '../types/reminder';
import { calculateNextDueDate, formatDate, getToday, getTimeRemaining } from '../utils/dateUtils';
import { generateAlertMessage, getSeverityLevel, formatAlertForConsole } from '../utils/alertGenerator';

const DEFAULT_CONFIG: ReminderConfig = {
  checkIntervalDays: 7,
  alertThresholds: { info: 30, warning: 14, urgent: 7 },
};

interface VaccinationRecord {
  vaccineName: string;
  lastAdministeredDate?: Date;
  recommendedIntervalDays: number;
  boostersRequired: boolean;
}

export class VaccinationReminderService {
  private config: ReminderConfig;
  private logger: (message: string, context?: unknown) => void;

  constructor(options: ReminderServiceOptions = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options.config };
    this.logger = options.logger || console.log;
  }

  calculateNextDueDates(petId: string, vaccinations: VaccinationRecord[]): VaccinationReminder[] {
    const reminders: VaccinationReminder[] = [];

    for (let i = 0; i < vaccinations.length; i++) {
      const vaccination = vaccinations[i];
      if (!vaccination.lastAdministeredDate) {
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 7);

        reminders.push({
          id: this.generateReminderId(petId, vaccination.vaccineName),
          petId,
          vaccineName: vaccination.vaccineName,
          nextDueDate,
          daysUntilDue: Math.ceil((nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          isOverdue: false,
          lastAdministeredDate: undefined,
          recommendedIntervalDays: vaccination.recommendedIntervalDays || 365,
        });
      } else {
        const nextDueDate = calculateNextDueDate(
          vaccination.lastAdministeredDate,
          vaccination.recommendedIntervalDays || 365
        );

        reminders.push({
          id: this.generateReminderId(petId, vaccination.vaccineName),
          petId,
          vaccineName: vaccination.vaccineName,
          nextDueDate,
          daysUntilDue: Math.ceil((nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          isOverdue: nextDueDate < new Date(),
          lastAdministeredDate: vaccination.lastAdministeredDate,
          recommendedIntervalDays: vaccination.recommendedIntervalDays || 365,
        });
      }
    }

    return reminders.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return b.daysUntilDue - a.daysUntilDue;
    });
  }

  generateAlerts(petId: string, reminders: VaccinationReminder[]): Alert[] {
    const alerts: Alert[] = [];

    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      if (reminder.isOverdue) {
        alerts.push({
          id: this.generateAlertId('vaccination_overdue', reminder.id),
          type: 'vaccination_overdue',
          severity: 'urgent',
          title: 'Vaccination Overdue: ' + reminder.vaccineName,
          message: generateAlertMessage(reminder.vaccineName, reminder.daysUntilDue, true),
          createdAt: new Date(),
          relatedEntityId: reminder.id,
          relatedEntityType: 'reminder',
        });
      } else if (reminder.daysUntilDue <= this.config.alertThresholds.urgent) {
        alerts.push({
          id: this.generateAlertId('vaccination_due', reminder.id),
          type: 'vaccination_due',
          severity: 'urgent',
          title: 'Vaccination Due Soon: ' + reminder.vaccineName,
          message: generateAlertMessage(reminder.vaccineName, reminder.daysUntilDue, false),
          createdAt: new Date(),
          relatedEntityId: reminder.id,
          relatedEntityType: 'reminder',
        });
      } else if (reminder.daysUntilDue <= this.config.alertThresholds.warning) {
        alerts.push({
          id: this.generateAlertId('vaccination_due', reminder.id),
          type: 'vaccination_due',
          severity: 'warning',
          title: 'Vaccination Reminder: ' + reminder.vaccineName,
          message: generateAlertMessage(reminder.vaccineName, reminder.daysUntilDue, false),
          createdAt: new Date(),
          relatedEntityId: reminder.id,
          relatedEntityType: 'reminder',
        });
      } else if (reminder.daysUntilDue <= this.config.alertThresholds.info) {
        alerts.push({
          id: this.generateAlertId('vaccination_due', reminder.id),
          type: 'vaccination_due',
          severity: 'info',
          title: 'Upcoming Vaccination: ' + reminder.vaccineName,
          message: generateAlertMessage(reminder.vaccineName, reminder.daysUntilDue, false),
          createdAt: new Date(),
          relatedEntityId: reminder.id,
          relatedEntityType: 'reminder',
        });
      }
    }

    return alerts;
  }

  getPetRemindersWithAlerts(petId: string, vaccinations: VaccinationRecord[]): { reminders: VaccinationReminder[]; alerts: Alert[] } {
    const reminders = this.calculateNextDueDates(petId, vaccinations);
    const alerts = this.generateAlerts(petId, reminders);
    return { reminders, alerts };
  }

  isOverdue(reminder: VaccinationReminder): boolean {
    return reminder.isOverdue;
  }

  getDaysUntilDue(reminder: VaccinationReminder): number {
    return reminder.daysUntilDue;
  }

  private generateReminderId(petId: string, vaccineName: string): string {
    const timestamp = Date.now().toString(36);
    return 'reminder_' + petId + '_' + vaccineName.toLowerCase().replace(/\s+/g, '_') + '_' + timestamp;
  }

  private generateAlertId(type: string, relatedId: string): string {
    const timestamp = Date.now().toString(36);
    return 'alert_' + type + '_' + relatedId + '_' + timestamp;
  }

  private logReminders(petId: string, reminders: VaccinationReminder[]): void {
    this.logger('Calculated ' + reminders.length + ' reminders for pet ' + petId + ':');
    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      const status = reminder.isOverdue ? 'OVERDUE' : 'Due in ' + reminder.daysUntilDue + ' days';
      this.logger('  - ' + reminder.vaccineName + ': ' + status);
    }
  }
}

export const vaccinationReminderService = new VaccinationReminderService();
