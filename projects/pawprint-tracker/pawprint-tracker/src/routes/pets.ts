import { Router, Request, Response } from 'express';
import { pool } from '../database';
import { Pet } from '../types/pet';

const router = Router();

/**
 * GET /api/v1/pets/:id
 * Retrieve a single pet by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format (UUID)
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Pet ID must be a valid UUID'
        }
      });
    }

    // Query pet by ID using parameterized query to prevent SQL injection
    const query = `
      SELECT 
        id,
        owner_id,
        name,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        created_at,
        updated_at
      FROM pets
      WHERE id = $1
    `;
    const result = await pool.query<Pet>(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found'
        }
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving pet:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve pet details'
      }
    });
  }
});

/**
 * PUT /api/v1/pets/:id
 * Update an existing pet's information
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ID format (UUID)
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Pet ID must be a valid UUID'
        }
      });
    }

    // Validate required fields
    const allowedFields = ['name', 'species', 'breed', 'age', 'gender', 'weight', 'color', 'owner_id'];
    const providedUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        // Validate gender enum
        if (key === 'gender' && typeof value === 'string') {
          if (!['male', 'female'].includes(value)) {
            return res.status(400).json({
              error: {
                code: 'INVALID_GENDER',
                message: 'Gender must be either "male" or "female"'
              }
            });
          }
        }
        // Validate age is a positive number
        if (key === 'age' && typeof value === 'number') {
          if (value < 0) {
            return res.status(400).json({
              error: {
                code: 'INVALID_AGE',
                message: 'Age must be a non-negative number'
              }
            });
          }
        }
        // Validate weight is a positive number
        if (key === 'weight' && typeof value === 'number') {
          if (value < 0) {
            return res.status(400).json({
              error: {
                code: 'INVALID_WEIGHT',
                message: 'Weight must be a non-negative number'
              }
            });
          }
        }
        providedUpdates[key] = value;
      }
    }

    if (Object.keys(providedUpdates).length === 0) {
      return res.status(400).json({
        error: {
          code: 'NO_UPDATES',
          message: 'No valid updates provided'
        }
      });
    }

    // Build dynamic query based on provided fields
    const updateFields = Object.keys(providedUpdates);
    const setClause = updateFields.map((field, index) => `${field} = ${index + 2}`).join(', ');
    const values = [...Object.values(providedUpdates), id];

    const query = `
      UPDATE pets
      SET ${setClause},
          updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id,
        owner_id,
        name,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        created_at,
        updated_at
    `;

    const result = await pool.query<Pet>(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Pet updated successfully'
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update pet details'
      }
    });
  }
});

/**
 * DELETE /api/v1/pets/:id
 * Permanently delete a pet from the database
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format (UUID)
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Pet ID must be a valid UUID'
        }
      });
    }

    // Delete pet using parameterized query to prevent SQL injection
    const query = `
      DELETE FROM pets
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query<{ id: string }>(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found'
        }
      });
    }

    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete pet'
      }
    });
  }
});

export default router;
