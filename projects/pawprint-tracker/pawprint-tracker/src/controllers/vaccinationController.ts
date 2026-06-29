import { Response } from 'express';
import { Pool } from 'pg';
import { getPool } from '../config/database';

interface VaccinationParams {
  page: number;
  limit: number;
  petId?: string;
}

export const vaccinationController = {
  async getVaccinations(res: Response, params: VaccinationParams): Promise<void> {
    const pool = await getPool();
    
    try {
      let query = `
        SELECT 
          id,
          pet_id,
          vaccine_name,
          manufacturer,
          batch_number,
          administered_date,
          administering_vet,
          next_due_date,
          notes
        FROM vaccinations
        ORDER BY administered_date DESC
      `;
      
      const queryParams: any[] = [];

      if (params.petId) {
        query += ' WHERE pet_id = $1';
        queryParams.push(params.petId);
      }

      query += ` LIMIT $1 OFFSET $2`;
      queryParams.push(params.limit, params.page * params.limit - params.limit);

      const results = await pool.query(query, queryParams);
      
      let countQuery = 'SELECT COUNT(*) FROM vaccinations';
      const countParams: any[] = [];

      if (params.petId) {
        countQuery += ' WHERE pet_id = $1';
        countParams.push(params.petId);
      }

      const countResults = await pool.query(countQuery, countParams);
      const total = parseInt(countResults.rows[0].count, 10);
      const pages = Math.ceil(total / params.limit);

      res.status(200).json({
        data: results.rows.map((row) => ({
          id: row.id,
          pet_id: row.pet_id,
          vaccine_name: row.vaccine_name,
          manufacturer: row.manufacturer,
          batch_number: row.batch_number,
          administered_date: row.administered_date.toISOString(),
          administering_vet: row.administering_vet,
          next_due_date: row.next_due_date ? row.next_due_date.toISOString() : null,
          notes: row.notes
        })),
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          pages
        }
      });
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      throw new Error('Failed to fetch vaccination records');
    } finally {
      await pool.end();
    }
  },

  async getVaccinationById(res: Response, id: string | number): Promise<void> {
    const pool = await getPool();
    
    try {
      const result = await pool.query(
        `SELECT 
          id,
          pet_id,
          vaccine_name,
          manufacturer,
          batch_number,
          administered_date,
          administering_vet,
          next_due_date,
          notes
        FROM vaccinations
        WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Vaccination record not found'
          }
        });
      }

      const vaccination = result.rows[0];

      res.status(200).json({
        data: {
          id: vaccination.id,
          pet_id: vaccination.pet_id,
          vaccine_name: vaccination.vaccine_name,
          manufacturer: vaccination.manufacturer,
          batch_number: vaccination.batch_number,
          administered_date: vaccination.administered_date.toISOString(),
          administering_vet: vaccination.administering_vet,
          next_due_date: vaccination.next_due_date ? vaccination.next_due_date.toISOString() : null,
          notes: vaccination.notes
        }
      });
    } catch (error) {
      console.error('Error fetching vaccination:', error);
      throw new Error('Failed to fetch vaccination record');
    } finally {
      await pool.end();
    }
  },

  async createVaccination(res: Response, data: {
    pet_id: string | number;
    vaccine_name: string;
    manufacturer?: string | null;
    batch_number?: string | null;
    administered_date: Date;
    administering_vet?: string | null;
    next_due_date?: Date | null;
    notes?: string | null;
  }): Promise<void> {
    const pool = await getPool();
    
    try {
      const result = await pool.query(
        `INSERT INTO vaccinations (
          pet_id,
          vaccine_name,
          manufacturer,
          batch_number,
          administered_date,
          administering_vet,
          next_due_date,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id,
          pet_id,
          vaccine_name,
          manufacturer,
          batch_number,
          administered_date,
          administering_vet,
          next_due_date,
          notes`,
        [
          data.pet_id,
          data.vaccine_name,
          data.manufacturer ?? null,
          data.batch_number ?? null,
          data.administered_date,
          data.administering_vet ?? null,
          data.next_due_date ?? null,
          data.notes ?? null
        ]
      );

      res.status(201).json({
        data: {
          id: result.rows[0].id,
          pet_id: result.rows[0].pet_id,
          vaccine_name: result.rows[0].vaccine_name,
          manufacturer: result.rows[0].manufacturer,
          batch_number: result.rows[0].batch_number,
          administered_date: result.rows[0].administered_date.toISOString(),
          administering_vet: result.rows[0].administering_vet,
          next_due_date: result.rows[0].next_due_date ? result.rows[0].next_due_date.toISOString() : null,
          notes: result.rows[0].notes
        }
      });
    } catch (error) {
      console.error('Error creating vaccination:', error);
      throw new Error('Failed to create vaccination record');
    } finally {
      await pool.end();
    }
  },

  async updateVaccination(
    res: Response,
    id: string | number,
    data: Partial<{
      pet_id: string | number;
      vaccine_name: string;
      manufacturer: string | null;
      batch_number: string | null;
      administered_date: Date;
      administering_vet: string | null;
      next_due_date: Date | null;
      notes: string | null;
    }>
  ): Promise<void> {
    const pool = await getPool();
    
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.pet_id !== undefined) {
        fields.push('pet_id = $' + paramIndex++);
        values.push(data.pet_id);
      }
      if (data.vaccine_name !== undefined) {
        fields.push('vaccine_name = $' + paramIndex++);
        values.push(data.vaccine_name);
      }
      if (data.manufacturer !== undefined) {
        fields.push('manufacturer = $' + paramIndex++);
        values.push(data.manufacturer);
      }
      if (data.batch_number !== undefined) {
        fields.push('batch_number = $' + paramIndex++);
        values.push(data.batch_number);
      }
      if (data.administered_date !== undefined) {
        fields.push('administered_date = $' + paramIndex++);
        values.push(data.administered_date);
      }
      if (data.administering_vet !== undefined) {
        fields.push('administering_vet = $' + paramIndex++);
        values.push(data.administering_vet);
      }
      if (data.next_due_date !== undefined) {
        fields.push('next_due_date = $' + paramIndex++);
        values.push(data.next_due_date);
      }
      if (data.notes !== undefined) {
        fields.push('notes = $' + paramIndex++);
        values.push(data.notes);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'No fields provided for update'
          }
        });
      }

      values.push(id);
      const query = `UPDATE vaccinations 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING 
          id,
          pet_id,
          vaccine_name,
          manufacturer,
          batch_number,
          administered_date,
          administering_vet,
          next_due_date,
          notes`;

      const result = await pool.query(query, values);

      res.status(200).json({
        data: {
          id: result.rows[0].id,
          pet_id: result.rows[0].pet_id,
          vaccine_name: result.rows[0].vaccine_name,
          manufacturer: result.rows[0].manufacturer,
          batch_number: result.rows[0].batch_number,
          administered_date: result.rows[0].administered_date.toISOString(),
          administering_vet: result.rows[0].administering_vet,
          next_due_date: result.rows[0].next_due_date ? result.rows[0].next_due_date.toISOString() : null,
          notes: result.rows[0].notes
        }
      });
    } catch (error) {
      console.error('Error updating vaccination:', error);
      throw new Error('Failed to update vaccination record');
    } finally {
      await pool.end();
    }
  },

  async deleteVaccination(res: Response, id: string | number): Promise<void> {
    const pool = await getPool();
    
    try {
      const result = await pool.query(
        'DELETE FROM vaccinations WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Vaccination record not found'
          }
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      throw new Error('Failed to delete vaccination record');
    } finally {
      await pool.end();
    }
  }
};
