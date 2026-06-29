/**
 * Alert Generator Utility
 * Generates human-readable alert messages for vaccination reminders
 */

export type AlertSeverity = 'info' | 'warning' | 'urgent';

interface AlertMessageOptions {
  vaccineName: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

export function generateAlertMessage(vaccineName: string, daysUntilDue: number, isOverdue: boolean): string {
  const formattedVaccine = formatVaccineName(vaccineName);
  if (isOverdue) return generateOverdueMessage(formattedVaccine, daysUntilDue);
  if (daysUntilDue <= 7) return generateUrgentMessage(formattedVaccine, daysUntilDue);
  if (daysUntilDue <= 14) return generateWarningMessage(formattedVaccine, daysUntilDue);
  if (daysUntilDue <= 30) return generateInfoMessage(formattedVaccine, daysUntilDue);
  return generateUpcomingMessage(formattedVaccine, daysUntilDue);
}

function generateOverdueMessage(vaccineName: string, daysOverdue: number): string {
  const timePhrase = getTimePhrase(daysOverdue);
  return '⚠️ URGENT: ' + vaccineName + ' vaccination is ' + timePhrase + '. Please schedule a vet appointment immediately.';
}

function generateUrgentMessage(vaccineName: string, daysUntilDue: number): string {
  const timePhrase = getTimePhrase(daysUntilDue);
  return '🔔 URGENT: ' + vaccineName + ' vaccination is due in ' + timePhrase + '. Contact your veterinarian.';
}

function generateWarningMessage(vaccineName: string, daysUntilDue: number): string {
  const timePhrase = getTimePhrase(daysUntilDue);
  return '📅 REMINDER: ' + vaccineName + ' vaccination is due in ' + timePhrase + '. Consider scheduling soon.';
}

function generateInfoMessage(vaccineName: string, daysUntilDue: number): string {
  const timePhrase = getTimePhrase(daysUntilDue);
  return 'ℹ️ INFO: ' + vaccineName + ' vaccination scheduled in ' + timePhrase + '. Book at your convenience.';
}

function generateUpcomingMessage(vaccineName: string, daysUntilDue: number): string {
  return '📋 UPCOMING: ' + vaccineName + ' vaccination in approximately ' + daysUntilDue + ' days. No action needed.';
}

function getTimePhrase(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return days + ' day' + (days !== 1 ? 's' : '');
}

function formatVaccineName(name: string): string {
  const cleaned = name.trim();
  const words = cleaned.split(/[\s-]+/);
  return words.map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
}

export function getSeverityLevel(daysUntilDue: number, isOverdue: boolean): AlertSeverity {
  if (isOverdue) return 'urgent';
  if (daysUntilDue <= 7) return 'urgent';
  if (daysUntilDue <= 14) return 'warning';
  if (daysUntilDue <= 30) return 'info';
  return 'info';
}

export function getSeverityEmoji(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent': return '🔴';
    case 'warning': return '🟡';
    case 'info': return '🔵';
    default: return '⚪';
  }
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent': return '\x1b[31m';
    case 'warning': return '\x1b[33m';
    case 'info': return '\x1b[36m';
    default: return '\x1b[0m';
  }
}

export function formatAlertForConsole(alert: { severity: AlertSeverity; title: string; message: string }): string {
  const emoji = getSeverityEmoji(alert.severity);
  const color = getSeverityColor(alert.severity);
  return color + emoji + ' ' + alert.title + '\n' + alert.message + '\x1b[0m';
}

export function generatePetAlertSummary(petName: string, alerts: Array<{ severity: AlertSeverity; title: string; message: string }>): string {
  if (alerts.length === 0) return '✅ No vaccination reminders for ' + petName;
  const urgentCount = alerts.filter(function(a) { return a.severity === 'urgent'; }).length;
  const warningCount = alerts.filter(function(a) { return a.severity === 'warning'; }).length;
  const infoCount = alerts.filter(function(a) { return a.severity === 'info'; }).length;
  let summary = '📊 ' + petName + ' - Vaccination Summary:\n';
  if (urgentCount > 0) summary += '  🔴 URGENT: ' + urgentCount + ' vaccination' + (urgentCount !== 1 ? 's' : '') + '\n';
  if (warningCount > 0) summary += '  🟡 WARNING: ' + warningCount + ' vaccination' + (warningCount !== 1 ? 's' : '') + '\n';
  if (infoCount > 0) summary += '  🔵 INFO: ' + infoCount + ' upcoming vaccination' + (infoCount !== 1 ? 's' : '') + '\n';
  return summary;
}

export function generateAlertReport(alerts: Array<{ id: string; type: string; severity: AlertSeverity; title: string; message: string; createdAt: Date }>): string {
  const lines = [];
  lines.push('============================================================');
  lines.push('VACCINATION ALERT REPORT');
  lines.push('Generated: ' + new Date().toLocaleString());
  lines.push('Total Alerts: ' + alerts.length);
  lines.push('============================================================');
  const urgentCount = alerts.filter(function(a) { return a.severity === 'urgent'; }).length;
  const warningCount = alerts.filter(function(a) { return a.severity === 'warning'; }).length;
  const infoCount = alerts.filter(function(a) { return a.severity === 'info'; }).length;
  lines.push('\nSeverity Breakdown: Urgent: ' + urgentCount + ', Warning: ' + warningCount + ', Info: ' + infoCount);
  lines.push('\n' + '------------------------------------------------------------');
  lines.push('Alert Details:');
  for (var i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const timestamp = new Date(alert.createdAt).toLocaleString();
    lines.push('\n[' + alert.severity.toUpperCase() + '] ' + alert.title);
    lines.push('  ID: ' + alert.id + ', Type: ' + alert.type + ', Created: ' + timestamp);
    lines.push('  Message: ' + alert.message);
  }
  lines.push('\n' + '============================================================');
  return lines.join('\n');
}

export function shouldSendAlert(alert: { severity: AlertSeverity; createdAt: Date; lastSentAt?: Date }): boolean {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (new Date(alert.createdAt) > oneHourAgo) return false;
  if (alert.lastSentAt) {
    const twentyFourHoursAgo = new Date(alert.lastSentAt.getTime() - 24 * 60 * 60 * 1000);
    if (now < twentyFourHoursAgo) return false;
  }
  return true;
}

export function updateAlertLastSent(alertId: string): Date { return new Date(); }
