export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  manufacturer: string;
  lotNumber: string;
  administeredDate: string;
  administeringVet: string;
  clinicName: string;
  nextDueDate?: string;
}

export interface CreateVaccinationInput {
  petId: string;
  vaccineName: string;
  manufacturer: string;
  lotNumber: string;
  administeredDate: string;
  administeringVet: string;
  clinicName: string;
  nextDueDate?: string;
}

export interface VaccinationResponse {
  id: string;
  petId: string;
  vaccineName: string;
  manufacturer: string;
  lotNumber: string;
  administeredDate: string;
  administeringVet: string;
  clinicName: string;
  nextDueDate?: string;
}