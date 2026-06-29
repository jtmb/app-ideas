/**
 * Date Utility Functions
 * Helper functions for date calculations and formatting
 */

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options || { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', options || { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function calculateNextDueDate(referenceDate: Date | string, intervalDays: number): Date {
  const date = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;
  if (isNaN(date.getTime())) throw new Error('Invalid reference date');
  const nextDueDate = new Date(date);
  nextDueDate.setDate(nextDueDate.getDate() + intervalDays);
  return nextDueDate;
}

export function calculatePreviousDueDate(referenceDate: Date | string, intervalDays: number): Date {
  const date = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;
  if (isNaN(date.getTime())) throw new Error('Invalid reference date');
  const prevDueDate = new Date(date);
  prevDueDate.setDate(prevDueDate.getDate() - intervalDays);
  return prevDueDate;
}

export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isPastDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date() && !isNaN(d.getTime());
}

export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date() && !isNaN(d.getTime());
}

export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getTomorrow(): Date {
  const tomorrow = new Date(getToday());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) return isoDate;
  return null;
}

export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days);
}

export function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = getToday();
  const currentDay = today.getDay();
  if (currentDay === dayOfWeek) return addDays(today, 1);
  return addDays(today, dayOfWeek - currentDay);
}

export function isValidDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(d.getTime());
}

export function getTimeRemaining(targetDate: Date | string): string {
  const d = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = getToday();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return 'Overdue';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return days + ' day' + (days !== 1 ? 's' : '');
  if (hours > 0) return hours + ' hour' + (hours !== 1 ? 's' : '');
  return 'Due today';
}

export function getPetAge(birthDate: Date | string): { years: number; months: number; days: number } {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = getToday();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) { months--; const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0); days += prevMonth.getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

export function formatPetAge(birthDate: Date | string): string {
  const { years, months, days } = getPetAge(birthDate);
  if (years > 0) return years + ' year' + (years !== 1 ? 's' : '') + ', ' + months + ' month' + (months !== 1 ? 's' : '');
  if (months > 0) return months + ' month' + (months !== 1 ? 's' : '');
  return days + ' day' + (days !== 1 ? 's' : '');
}

export function getNextScheduledDate(startDate: Date | string, intervalDays: number): Date {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  if (isNaN(start.getTime())) throw new Error('Invalid start date');
  const nextDate = new Date(start);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
}

export function compareDates(date1: Date | string, date2: Date | string): -1 | 0 | 1 {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

export function getDifferenceInUnit(date1: Date | string, date2: Date | string, unit: 'days' | 'hours' | 'minutes' | 'seconds'): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  switch (unit) {
    case 'days': return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    case 'hours': return Math.floor(diffMs / (1000 * 60 * 60));
    case 'minutes': return Math.floor(diffMs / (1000 * 60));
    case 'seconds': return Math.floor(diffMs / 1000);
    default: throw new Error('Invalid unit');
  }
}

export function getNextBusinessDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (d.getDay() === 6) return addDays(d, 2);
  if (d.getDay() === 0) return addDays(d, 1);
  return addDays(d, 1);
}

export function getPreviousBusinessDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (d.getDay() === 6) return subtractDays(d, 1);
  if (d.getDay() === 0) return subtractDays(d, 2);
  return subtractDays(d, 1);
}

export function getDateAtTime(date: Date | string, hour: number, minute: number = 0): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setHours(hour, minute, 0, 0);
  return result;
}

export function getCurrentTimestamp(): string { return new Date().toISOString(); }

export function parseISO(timestamp: string): Date | null {
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
}
