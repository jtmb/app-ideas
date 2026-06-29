// ============================================================================
// PawPrint Tracker - VetVisit Repository
// ============================================================================

import { pool, query } from '../database';
import { VetVisit } from '../types';

/**
 * Repository for VetVisit entity operations
 */
export class VetVisitRepository {
  /**
   * Find all vet visits with pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    pet_id?: string;
    clinic_name?: string;
  }): Promise<{ data: VetVisit[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT 
        id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at
      FROM vet_visits
      WHERE 1=1
    `;
    const queryParams: unknown[] = [];

    if (params.pet_id) {
      queryText += ' AND pet_id = $';
      queryParams.push(params.pet_id);
    }

    if (params.clinic_name) {
      queryText += ' AND clinic_name ILIKE $';
      queryParams.push(`%${params.clinic_name}%`);
    }

    queryText += ` ORDER BY visit_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const [data] = await query<VetVisit[]>(queryText, queryParams);

    const totalQuery = `
      SELECT COUNT(*) as total FROM vet_visits
      WHERE 1=1
    `;
    if (params.pet_id) {
      totalQuery += ' AND pet_id = $1';
    }
    if (params.clinic_name) {
      totalQuery += ' AND clinic_name ILIKE $2';
    }

    const [totalResult] = await query<{ total: number }>(totalQuery, queryParams.slice(0, params.pet_id ? 2 : 1));

    return {
      data,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        pages: Math.ceil(totalResult.total / limit),
      },
    };
  }

  /**
   * Find a vet visit by ID
   */
  async findById(id: string): Promise<VetVisit | null> {
    const [rows] = await query<VetVisit[]>(`
      SELECT id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at
      FROM vet_visits
      WHERE id = $1
    `, [id]);

    return rows[0] || null;
  }

  /**
   * Find vet visits by pet ID
   */
  async findByPetId(petId: string): Promise<VetVisit[]> {
    const [rows] = await query<VetVisit[]>(`
      SELECT id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at
      FROM vet_visits
      WHERE pet_id = $1
      ORDER BY visit_date DESC
    `, [petId]);

    return rows;
  }

  /**
   * Create a new vet visit
   */
  async create(visit: Omit<VetVisit, 'id' | 'created_at'>): Promise<VetVisit> {
    const result = await query<VetVisit>(`
      INSERT INTO vet_visits (pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at
    `, [
      visit.pet_id,
      visit.visit_date,
      visit.clinic_name,
      visit.diagnosis,
      visit.treatment_notes,
      visit.cost,
    ]);

    return result[0];
  }

  /**
   * Update an existing vet visit
   */
  async update(id: string, updates: Partial<Omit<VetVisit, 'id' | 'pet_id' | 'created_at'>>): Promise<VetVisit | null> {
    const fields: string[] = [];
    const queryParams: unknown[] = [];

    if (updates.visit_date !== undefined) {
      fields.push('visit_date = $1');
      queryParams.push(updates.visit_date);
    }
    if (updates.clinic_name !== undefined) {
      fields.push('clinic_name = $1');
      queryParams.push(updates.clinic_name);
    }
    if (updates.diagnosis !== undefined) {
      fields.push('diagnosis = $1');
      queryParams.push(updates.diagnosis);
    }
    if (updates.treatment_notes !== undefined) {
      fields.push('treatment_notes = $1');
      queryParams.push(updates.treatment_notes);
    }
    if (updates.cost !== undefined) {
      fields.push('cost = $1');
      queryParams.push(updates.cost);
    }

    if (fields.length === 0) {
      return null;
    }

    queryParams.push(id);

    const result = await query<VetVisit>(`
      UPDATE vet_visits
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id, pet_id, visit_date, clinic_name, diagnosis, treatment_notes, cost, created_at
    `, queryParams);

    return result[0] || null;
  }

  /**
   * Delete a vet visit by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await query<{ affected_rows: number }>(`
      DELETE FROM vet_visits
      WHERE id = $1
      RETURNING id
    `, [id]);

    return result[0] !== undefined;
  }

  /**
   * Get total cost of vet visits for a pet
   */
  async getTotalCostByPetId(petId: string): Promise<number> {
    const [rows] = await query<{ total_cost: number }>(`
      SELECT COALESCE(SUM(cost), 0) as total_cost
      FROM vet_visits
      WHERE pet_id = $1
    `, [petId]);

    return rows[0].total_cost;
  }

  /**
   * Get visit count for a pet within a date range
   */
  async getVisitCountByDateRange(petId: string, startDate: Date, endDate: Date): Promise<number> {
    const [rows] = await query<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM vet_visits
      WHERE pet_id = $1
        AND visit_date >= $2
        AND visit_date <= $3
    `, [petId, startDate, endDate]);

    return rows[0].count;
  }
}

export const vetVisitRepository = new VetVisitRepository();