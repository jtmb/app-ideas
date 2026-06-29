export interface VaccinationRecord {
  id: string;
  pet_id: string;
  vaccine_name: string;
  date_administered: Date;
  next_due_date: Date | null;
  status: VaccinationStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type VaccinationStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface CreateVaccinationRecordInput {
  pet_id: string;
  vaccine_name: string;
  date_administered: Date;
  next_due_date?: Date | null;
  status?: VaccinationStatus;
  notes?: string | null;
}

export interface UpdateVaccinationRecordInput extends Partial<CreateVaccinationRecordInput> {
  id: string;
}