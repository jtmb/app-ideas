/**
 * Reminder Service Types
 * Defines interfaces for vaccination reminders and alerts
 */

export type AlertSeverity = 'info' | 'warning' | 'urgent';

export interface VaccinationReminder {
  id: string;
  petId: string;
  vaccineName: string;
  nextDueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  lastAdministeredDate?: Date;
  recommendedIntervalDays: number;
}

export interface Alert {
  id: string;
  type: 'vaccination_due' | 'vaccination_overdue' | 'health_checkup_due';
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: 'pet' | 'vaccine' | 'reminder';
}

export interface ReminderConfig {
  checkIntervalDays: number;
  alertThresholds: {
    info: number;
    warning: number;
    urgent: number;
  };
}

export interface ReminderServiceOptions {
  config?: Partial<ReminderConfig>;
  logger?: (message: string, context?: unknown) => void;
}
