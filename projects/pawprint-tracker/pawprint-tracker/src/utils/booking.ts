/**
 * Appointment Booking Utility
 * Provides date validation and conflict detection for pet appointment scheduling.
 */

import { AppointmentsRepository } from '../repositories/appointments.repository';
import { PetsRepository } from '../repositories/pets.repository';
import { VetsRepository } from '../repositories/vets.repository';
import { Appointment, Pet, Vet, BookingConflict } from '../types';

const MAX_APPOINTMENT_DURATION_MINUTES = 60;

export function validateDate(dateString: string): { isValid: boolean; error?: string } {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Date is required' };
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format. Use ISO format (YYYY-MM-DD)' };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) {
    return { isValid: false, error: 'Appointments cannot be scheduled for past dates' };
  }
  const maxFutureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (date > maxFutureDate) {
    return { isValid: false, error: 'Appointments cannot be scheduled more than 1 year in advance' };
  }
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isValid: false, error: 'Appointments cannot be scheduled on weekends' };
  }
  return { isValid: true };
}

export function validateBusinessHours(dateString: string): { isValid: boolean; error?: string } {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  const hour = date.getHours();
  if (hour < 9 || hour >= 17) {
    return { isValid: false, error: 'Appointments are only available between 9 AM and 5 PM' };
  }
  return { isValid: true };
}

export async function checkAppointmentConflicts(
  newAppointment: Partial<Appointment>,
  appointmentsRepository: AppointmentsRepository,
  petsRepository: PetsRepository,
  vetsRepository: VetsRepository
): Promise<BookingConflict[]> {
  const conflicts: BookingConflict[] = [];
  if (!newAppointment.petId || !newAppointment.vetId || !newAppointment.startDateTime) {
    return conflicts;
  }
  const newStart = new Date(newAppointment.startDateTime);
  const newEnd = new Date(newAppointment.startDateTime);
  newEnd.setMinutes(newEnd.getMinutes() + MAX_APPOINTMENT_DURATION_MINUTES);
  const existingAppointments = await appointmentsRepository.findByPetId(newAppointment.petId);
  for (const existing of existingAppointments) {
    const existingStart = new Date(existing.startDateTime);
    const existingEnd = new Date(existing.startDateTime);
    existingEnd.setMinutes(existingEnd.getMinutes() + MAX_APPOINTMENT_DURATION_MINUTES);
    if (newStart < existingEnd && newEnd > existingStart) {
      conflicts.push({
        type: 'time_overlap',
        petId: newAppointment.petId,
        existingAppointmentId: existing.id,
        existingPetName: existing.pet?.name || 'Unknown Pet',
        existingVetName: existing.vet?.name || 'Unknown Vet',
        existingStartDateTime: existing.startDateTime,
        existingEndDateTime: existing.endDateTime,
        newStartDateTime: newAppointment.startDateTime,
        message: `Time conflict with appointment on ${formatDateTime(existing.startDateTime)} for ${existing.pet?.name} with ${existing.vet?.name}`
      });
    }
  }
  const existingVetAppointments = await appointmentsRepository.findByVetId(newAppointment.vetId);
  for (const existing of existingVetAppointments) {
    if (existing.petId === newAppointment.petId) continue;
    const existingStart = new Date(existing.startDateTime);
    const existingEnd = new Date(existing.startDateTime);
    existingEnd.setMinutes(existingEnd.getMinutes() + MAX_APPOINTMENT_DURATION_MINUTES);
    if (isSameDay(newAppointment.startDateTime, existing.startDateTime)) {
      if (newStart < existingEnd && newEnd > existingStart) {
        conflicts.push({
          type: 'vet_capacity',
          petId: newAppointment.petId,
          existingAppointmentId: existing.id,
          existingPetName: existing.pet?.name || 'Unknown Pet',
          existingVetName: existing.vet?.name || 'Unknown Vet',
          existingStartDateTime: existing.startDateTime,
          existingEndDateTime: existing.endDateTime,
          newStartDateTime: newAppointment.startDateTime,
          message: `Vet ${existing.vet?.name} already has an appointment at ${formatDateTime(existing.startDateTime)} for ${existing.pet?.name}`
        });
      }
    }
  }
  return conflicts;
}

function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return date.toLocaleString('en-US', options);
}

export function calculateAppointmentEndTime(startDateTime: string, durationMinutes: number = MAX_APPOINTMENT_DURATION_MINUTES): string {
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  return endDate.toISOString().slice(0, -1);
}

export async function findAvailableTimeSlots(
  petId: string,
  vetId: string,
  fromDate?: string,
  appointmentsRepository: AppointmentsRepository = new AppointmentsRepository()
): Promise<{ date: string; availableSlots: string[] }[]> {
  const slots: { date: string; availableSlots: string[] }[] = [];
  const startDate = fromDate ? new Date(fromDate) : new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 28);
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const dateStr = d.toISOString().slice(0, 10);
    const availableSlots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      const slotDate = new Date(d);
      slotDate.setHours(hour, 0, 0, 0);
      const slotDateTime = slotDate.toISOString().slice(0, -1);
      const existingAppointments = await appointmentsRepository.findByPetId(petId);
      let isBooked = false;
      for (const appointment of existingAppointments) {
        const apptStart = new Date(appointment.startDateTime);
        const apptEnd = new Date(appointment.startDateTime);
        apptEnd.setMinutes(apptEnd.getMinutes() + MAX_APPOINTMENT_DURATION_MINUTES);
        if (slotDate < apptEnd && slotDate > apptStart) {
          isBooked = true;
          break;
        }
      }
      if (!isBooked) {
        availableSlots.push(slotDateTime);
      }
    }
    if (availableSlots.length > 0) {
      slots.push({ date: dateStr, availableSlots });
    }
  }
  return slots;
}

export function validateAppointmentDuration(durationMinutes: number): { isValid: boolean; error?: string } {
  if (durationMinutes <= 0) {
    return { isValid: false, error: 'Appointment duration must be positive' };
  }
  if (durationMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
    return { isValid: false, error: `Maximum appointment duration is ${MAX_APPOINTMENT_DURATION_MINUTES} minutes` };
  }
  return { isValid: true };
}

export function createAppointmentWithEndTime(startDateTime: string, durationMinutes: number = MAX_APPOINTMENT_DURATION_MINUTES): Appointment {
  const endDateTime = calculateAppointmentEndTime(startDateTime, durationMinutes);
  return { id: '', petId: '', vetId: '', startDateTime, endDateTime, status: 'scheduled', notes: '' };
}

export function validateBookingWindow(dateString: string, now = new Date()): { isValid: boolean; error?: string } {
  const bookingDate = new Date(dateString);
  if (bookingDate < now) {
    return { isValid: false, error: 'Cannot book appointments for past dates' };
  }
  const maxFutureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (bookingDate > maxFutureDate) {
    return { isValid: false, error: 'Cannot book appointments more than 1 year in advance' };
  }
  const minBookingWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (bookingDate < minBookingWindow) {
    return { isValid: false, error: 'Appointments must be booked at least 24 hours in advance' };
  }
  return { isValid: true };
}
