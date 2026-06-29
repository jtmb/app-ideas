// ============================================================================
// PawPrint Tracker - TypeScript Type Definitions
// ============================================================================

/**
 * Base interface for all entities with common fields
 */
export interface BaseEntity {
  id: string;
  created_at: Date;
}

/**
 * Pet entity representing a pet in the system
 */
export interface Pet extends BaseEntity {
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  color: string;
  microchip_number?: string;
  photo_url?: string;
}

/**
 * Vaccination record for a pet
 */
export interface Vaccination extends BaseEntity {
  pet_id: string;
  vaccine_name: string;
  manufacturer: string;
  batch_number: string;
  expiration_date: Date;
  administered_date: Date;
  administering_vet?: string;
  next_due_date?: Date;
}

/**
 * Vet visit record for a pet
 */
export interface VetVisit extends BaseEntity {
  pet_id: string;
  visit_date: Date;
  clinic_name: string;
  diagnosis: string;
  treatment_notes: string;
  cost: number;
}

/**
 * Medication prescription for a pet
 */
export interface Medication extends BaseEntity {
  pet_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: Date;
  end_date?: Date;
  prescribed_by: string;
  refills_remaining: number;
}

/**
 * Health journal entry for a pet
 */
export interface HealthJournal extends BaseEntity {
  pet_id: string;
  entry_date: Date;
  symptom_description: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

/**
 * User entity representing the system owner/admin
 */
export interface User extends BaseEntity {
  email: string;
  password_hash: string;
  full_name: string;
  is_active: boolean;
}

/**
 * API Response wrapper for success responses
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * API Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standard error response for failed operations
 */
export type ErrorResponse = ApiResponse<ApiError>;

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}