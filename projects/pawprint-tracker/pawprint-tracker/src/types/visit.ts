// Visit-related TypeScript types for PawPrint Tracker

export interface Visit {
  id: string;
  petId: string;
  vetName: string;
  clinicName: string;
  visitDate: string; // ISO date string
  reason: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitInput {
  petId: string;
  vetName: string;
  clinicName: string;
  visitDate: string; // ISO date string
  reason: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateVisitInput {
  vetName?: string;
  clinicName?: string;
  visitDate?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  cost?: number;
  notes?: string;
}

export interface VisitWithPet extends Visit {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
}

// Validation error types
export type ValidationError = {
  field: string;
  message: string;
};

export interface VisitValidationErrors extends Array<ValidationError> {}