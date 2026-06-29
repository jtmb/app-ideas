/**
 * Validation Utilities
 * Provides input validation for pet health tracking application.
 */

import { Pet, Vet, Appointment } from '../types';

export function validatePet(pet: Partial<Pet>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pet.name || pet.name.trim().length === 0) {
    errors.push('Pet name is required');
  } else if (pet.name.trim().length > 100) {
    errors.push('Pet name must be less than 100 characters');
  }
  
  if (!pet.species || pet.species.trim().length === 0) {
    errors.push('Species is required');
  } else if (pet.species.trim().length > 50) {
    errors.push('Species must be less than 50 characters');
  }
  
  if (!pet.breed || pet.breed.trim().length === 0) {
    errors.push('Breed is required');
  } else if (pet.breed.trim().length > 100) {
    errors.push('Breed must be less than 100 characters');
  }
  
  if (!pet.age || pet.age < 0) {
    errors.push('Age must be a non-negative number');
  }
  
  if (pet.gender && !['male', 'female', 'other'].includes(pet.gender.toLowerCase())) {
    errors.push('Gender must be male, female, or other');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateVet(vet: Partial<Vet>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!vet.name || vet.name.trim().length === 0) {
    errors.push('Vet name is required');
  } else if (vet.name.trim().length > 100) {
    errors.push('Vet name must be less than 100 characters');
  }
  
  if (!vet.specialty || vet.specialty.trim().length === 0) {
    errors.push('Specialty is required');
  } else if (vet.specialty.trim().length > 100) {
    errors.push('Specialty must be less than 100 characters');
  }
  
  if (!vet.phone || vet.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!/^\+?\d{10,15}$/.test(vet.phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateAppointment(appointment: Partial<Appointment>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!appointment.petId || appointment.petId.trim().length === 0) {
    errors.push('Pet ID is required');
  }
  
  if (!appointment.vetId || appointment.vetId.trim().length === 0) {
    errors.push('Vet ID is required');
  }
  
  if (!appointment.startDateTime || appointment.startDateTime.trim().length === 0) {
    errors.push('Start datetime is required');
  } else {
    const date = new Date(appointment.startDateTime);
    if (isNaN(date.getTime())) {
      errors.push('Invalid start datetime format. Use ISO format (YYYY-MM-DDTHH:mm:ss)');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
}

export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }
  const cleaned = phone.replace(/\s+-/g, '');
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  return { isValid: true };
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength);
}
