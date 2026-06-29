// API Response Types for Paw Print Tracker

import { Request, Response } from 'express';

/**
 * Standard error response shape following api-design.instructions.md
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Base API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Filter options for visits endpoint
 */
export interface VisitFilterOptions {
  petId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'completed' | 'scheduled' | 'cancelled';
}

/**
 * Vet visit record
 */
export interface VetVisit {
  id: string;
  petId: string;
  petName: string;
  vetName: string;
  clinicName: string;
  appointmentDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  reason: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  medications?: VetMedication[];
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Vet medication record
 */
export interface VetMedication {
  name: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  instructions?: string;
}

/**
 * Create visit request body
 */
export interface CreateVisitRequest {
  petId: string;
  vetName: string;
  clinicName: string;
  appointmentDate: string;
  checkInTime?: string;
  reason: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  medications?: VetMedicationCreateRequest[];
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

/**
 * Create medication request body
 */
export interface VetMedicationCreateRequest {
  name: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  instructions?: string;
}

/**
 * Update visit request body (partial)
 */
export interface UpdateVisitRequest {
  vetName?: string;
  clinicName?: string;
  appointmentDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  reason?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  medications?: VetMedicationCreateRequest[];
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

/**
 * Express request extension with query params
 */
export interface VisitQuery extends PaginationQuery {
  petId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'completed' | 'scheduled' | 'cancelled';
}

/**
 * Express response type for visits endpoint
 */
export type VisitResponse = ApiResponse<VetVisit[]>;