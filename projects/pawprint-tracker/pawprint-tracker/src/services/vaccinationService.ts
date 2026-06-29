import { Pool } from 'pg';

export class VaccinationNotFoundError extends Error {
  constructor(public vaccinationId: string) {
    super(`Vaccination with ID ${vaccinationId} not found`);
    this.name = 'VaccinationNotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class VaccinationService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new vaccination record
   */
  async createVaccination(
    petId: string,
    vaccineName: string,
    dateAdministered: Date,
    veterinarian?: string,
    notes?: string,
    batchNumber?: string,
    expiryDate?: Date
  ): Promise<{ id: string; petId: string; vaccineName: string; dateAdministered: Date; veterinarian: string | null; notes: string | null; batchNumber: string | null; expiryDate: Date | null; createdAt: Date; updatedAt: Date }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO vaccinations (pet_id, vaccine_name, date_administered, veterinarian, notes, batch_number, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, pet_id, vaccine_name, date_administered, veterinarian, notes, batch_number, expiry_date, created_at, updated_at`,
        [petId, vaccineName, dateAdministered, veterinarian || null, notes || null, batchNumber || null, expiryDate || null]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a vaccination record by ID
   */
  async getVaccinationById(id: string): Promise<{ id: string; petId: string; vaccineName: string; dateAdministered: Date; veterinarian: string | null; notes: string | null; batchNumber: string | null; expiryDate: Date | null; createdAt: Date; updatedAt: Date }> {
    const result = await this.pool.query(
      `SELECT id, pet_id, vaccine_name, date_administered, veterinarian, notes, batch_number, expiry_date, created_at, updated_at
       FROM vaccinations
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new VaccinationNotFoundError(id);
    }

    return result.rows[0];
  }

  /**
   * Get all vaccination records for a pet
   */
  async getVaccinationsByPetId(petId: string): Promise<{ id: string; petId: string; vaccineName: string; dateAdministered: Date; veterinarian: string | null; notes: string | null; batchNumber: string | null; expiryDate: Date | null; createdAt: Date; updatedAt: Date }[]> {
    const result = await this.pool.query(
      `SELECT id, pet_id, vaccine_name, date_administered, veterinarian, notes, batch_number, expiry_date, created_at, updated_at
       FROM vaccinations
       WHERE pet_id = $1
       ORDER BY date_administered DESC`,
      [petId]
    );

    return result.rows;
  }

  /**
   * Update a vaccination record
   */
  async updateVaccination(
    id: string,
    updates: { petId?: string; vaccineName?: string; dateAdministered?: Date; veterinarian?: string; notes?: string; batchNumber?: string; expiryDate?: Date }
  ): Promise<{ id: string; petId: string; vaccineName: string; dateAdministered: Date; veterinarian: string | null; notes: string | null; batchNumber: string | null; expiryDate: Date | null; createdAt: Date; updatedAt: Date }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // First, check if vaccination exists and get current petId
      const existingResult = await client.query(
        `SELECT id, pet_id FROM vaccinations WHERE id = $1`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        throw new VaccinationNotFoundError(id);
      }

      const currentPetId = existingResult.rows[0].pet_id;

      // If petId is being updated, check for conflicts (same pet already has this vaccine on same date)
      if (updates.petId && updates.petId !== currentPetId) {
        const conflictCheck = await client.query(
          `SELECT id FROM vaccinations
           WHERE pet_id = $1
           AND vaccine_name = $2
           AND date_administered = $3
           AND id != $4`,
          [updates.petId, updates.vaccineName || '', updates.dateAdministered || new Date(), id]
        );

        if (conflictCheck.rows.length > 0) {
          throw new ConflictError('A vaccination record for this pet with the same vaccine on the same date already exists');
        }
      }

      // Build update query dynamically based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.petId !== undefined) {
        updateFields.push('pet_id = $' + paramIndex);
        values.push(updates.petId);
        paramIndex++;
      }

      if (updates.vaccineName !== undefined) {
        updateFields.push('vaccine_name = $' + paramIndex);
        values.push(updates.vaccineName);
        paramIndex++;
      }

      if (updates.dateAdministered !== undefined) {
        updateFields.push('date_administered = $' + paramIndex);
        values.push(updates.dateAdministered);
        paramIndex++;
      }

      if (updates.veterinarian !== undefined) {
        updateFields.push('veterinarian = $' + paramIndex);
        values.push(updates.veterinarian || null);
        paramIndex++;
      }

      if (updates.notes !== undefined) {
        updateFields.push('notes = $' + paramIndex);
        values.push(updates.notes || null);
        paramIndex++;
      }

      if (updates.batchNumber !== undefined) {
        updateFields.push('batch_number = $' + paramIndex);
        values.push(updates.batchNumber || null);
        paramIndex++;
      }

      if (updates.expiryDate !== undefined) {
        updateFields.push('expiry_date = $' + paramIndex);
        values.push(updates.expiryDate || null);
        paramIndex++;
      }

      // Update the record with current timestamp
      updateFields.push('updated_at = NOW()');
      values.push(id);

      const updateQuery = `UPDATE vaccinations SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
      await client.query(updateQuery, values);

      // Fetch updated record
      const result = await client.query(
        `SELECT id, pet_id, vaccine_name, date_administered, veterinarian, notes, batch_number, expiry_date, created_at, updated_at
         FROM vaccinations
         WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a vaccination record
   */
  async deleteVaccination(id: string): Promise<void> {
    const result = await this.pool.query(
      `DELETE FROM vaccinations WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new VaccinationNotFoundError(id);
    }
  }
}

export const vaccinationService = new VaccinationService(new Pool({
  connectionString: process.env.DATABASE_URL,
}));
    return result.rows;
  }