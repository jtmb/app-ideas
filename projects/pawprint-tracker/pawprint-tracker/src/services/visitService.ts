// Visit Service for Paw Print Tracker
import { Pool } from 'pg';
import { 
  VetVisit, 
  CreateVisitRequest, 
  UpdateVisitRequest, 
  VisitFilterOptions,
  PaginationQuery 
} from '../types/api';

/**
 * VisitService handles all database operations for vet visits
 */
export class VisitService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get paginated list of visits with optional filters
   */
  async getVisits(
    filters: VisitFilterOptions,
    pagination: PaginationQuery
  ): Promise<{ visits: VetVisit[]; total: number }> {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = `
      SELECT v.id, v.pet_id, p.name AS pet_name, v.vet_name, v.clinic_name,
        v.appointment_date, v.check_in_time, v.check_out_time, v.reason,
        COALESCE(v.symptoms, '[]'::jsonb) AS symptoms, v.diagnosis,
        v.treatment, COALESCE(v.medications, '[]'::jsonb) AS medications,
        v.notes, v.status, v.created_at, v.updated_at
      FROM visits v JOIN pets p ON v.pet_id = p.id WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 0;

    if (filters.petId) {
      query += ` AND v.pet_id = $${paramIndex + 1}`;
      params.push(filters.petId);
      paramIndex++;
    }
    if (filters.startDate) {
      query += ` AND v.appointment_date >= $${paramIndex + 1}`;
      params.push(filters.startDate);
      paramIndex++;
    }
    if (filters.endDate) {
      query += ` AND v.appointment_date <= $${paramIndex + 1}`;
      params.push(filters.endDate);
      paramIndex++;
    }
    if (filters.status) {
      query += ` AND v.status = $${paramIndex + 1}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ` ORDER BY v.appointment_date DESC, v.created_at DESC`;
    query += ` LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    
    // Get total count for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM visits v JOIN pets p ON v.pet_id = p.id WHERE 1=1`;
    let countParams: any[] = [];
    if (filters.petId) {
      countQuery += ` AND v.pet_id = $${countParams.length + 1}`;
      countParams.push(filters.petId);
    }
    if (filters.startDate) {
      countQuery += ` AND v.appointment_date >= $${countParams.length + 1}`;
      countParams.push(filters.startDate);
    }
    if (filters.endDate) {
      countQuery += ` AND v.appointment_date <= $${countParams.length + 1}`;
      countParams.push(filters.endDate);
    }
    if (filters.status) {
      countQuery += ` AND v.status = $${countParams.length + 1}`;
      countParams.push(filters.status);
    }

    const countResult = await this.pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total, 10);

    return { visits: result.rows.map(row => this.mapVisitFromRow(row)), total };
  }

  /**
   * Get a single visit by ID
   */
  async getVisitById(id: string): Promise<VetVisit | null> {
    const query = `
      SELECT v.id, v.pet_id, p.name AS pet_name, v.vet_name, v.clinic_name,
        v.appointment_date, v.check_in_time, v.check_out_time, v.reason,
        COALESCE(v.symptoms, '[]'::jsonb) AS symptoms, v.diagnosis,
        v.treatment, COALESCE(v.medications, '[]'::jsonb) AS medications,
        v.notes, v.status, v.created_at, v.updated_at
      FROM visits v JOIN pets p ON v.pet_id = p.id WHERE v.id = $1
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapVisitFromRow(result.rows[0]);
  }

  /**
   * Create a new visit
   */
  async createVisit(data: CreateVisitRequest): Promise<VetVisit> {
    const query = `
      INSERT INTO visits (pet_id, vet_name, clinic_name, appointment_date, check_in_time,
        reason, symptoms, diagnosis, treatment, medications, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, pet_id, pet_name, vet_name, clinic_name, appointment_date,
        check_in_time, check_out_time, reason, symptoms, diagnosis,
        treatment, medications, notes, status, created_at, updated_at
    `;
    const params = [
      data.petId, data.vetName, data.clinicName, data.appointmentDate,
      data.checkInTime || null, data.reason,
      data.symptoms ? JSON.stringify(data.symptoms) : '[]'::jsonb,
      data.diagnosis || null, data.treatment || null,
      data.medications ? JSON.stringify(data.medications) : '[]'::jsonb,
      data.notes || null, data.status
    ];
    const result = await this.pool.query(query, params);
    return this.mapVisitFromRow(result.rows[0]);
  }

  /**
   * Update an existing visit
   */
  async updateVisit(id: string, data: UpdateVisitRequest): Promise<VetVisit> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.vetName !== undefined) { updates.push(`vet_name = $${paramIndex}`); params.push(data.vetName); paramIndex++; }
    if (data.clinicName !== undefined) { updates.push(`clinic_name = $${paramIndex}`); params.push(data.clinicName); paramIndex++; }
    if (data.appointmentDate !== undefined) { updates.push(`appointment_date = $${paramIndex}`); params.push(data.appointmentDate); paramIndex++; }
    if (data.checkInTime !== undefined) { updates.push(`check_in_time = $${paramIndex}`); params.push(data.checkInTime); paramIndex++; }
    if (data.checkOutTime !== undefined) { updates.push(`check_out_time = $${paramIndex}`); params.push(data.checkOutTime); paramIndex++; }
    if (data.reason !== undefined) { updates.push(`reason = $${paramIndex}`); params.push(data.reason); paramIndex++; }
    if (data.symptoms !== undefined) { updates.push(`symptoms = $${paramIndex}`); params.push(data.symptoms ? JSON.stringify(data.symptoms) : '[]'::jsonb); paramIndex++; }
    if (data.diagnosis !== undefined) { updates.push(`diagnosis = $${paramIndex}`); params.push(data.diagnosis); paramIndex++; }
    if (data.treatment !== undefined) { updates.push(`treatment = $${paramIndex}`); params.push(data.treatment); paramIndex++; }
    if (data.medications !== undefined) { updates.push(`medications = $${paramIndex}`); params.push(data.medications ? JSON.stringify(data.medications) : '[]'::jsonb); paramIndex++; }
    if (data.notes !== undefined) { updates.push(`notes = $${paramIndex}`); params.push(data.notes); paramIndex++; }
    if (data.status !== undefined) { updates.push(`status = $${paramIndex}`); params.push(data.status); paramIndex++; }

    updates.push(`updated_at = NOW()`);
    params.push();

    const query = `UPDATE visits SET ${updates.join(', ')} WHERE id = $1 RETURNING id, pet_id, pet_name, vet_name, clinic_name, appointment_date, check_in_time, check_out_time, reason, symptoms, diagnosis, treatment, medications, notes, status, created_at, updated_at`;
    params.unshift(id);
    const result = await this.pool.query(query, params);
    return this.mapVisitFromRow(result.rows[0]);
  }

  /**
   * Delete a visit (soft delete by setting status to cancelled)
   */
  async deleteVisit(id: string): Promise<void> {
    const query = `UPDATE visits SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND status != 'cancelled'`;
    await this.pool.query(query, [id]);
  }

  /**
   * Map database row to VetVisit type
   */
  private mapVisitFromRow(row: any): VetVisit {
    return {
      id: row.id, petId: row.pet_id, petName: row.pet_name, vetName: row.vet_name,
      clinicName: row.clinic_name, appointmentDate: row.appointment_date,
      checkInTime: row.check_in_time, checkOutTime: row.check_out_time,
      reason: row.reason, symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
      diagnosis: row.diagnosis, treatment: row.treatment,
      medications: row.medications ? JSON.parse(row.medications) : [],
      notes: row.notes, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at
    };
  }
}

export default VisitService;
