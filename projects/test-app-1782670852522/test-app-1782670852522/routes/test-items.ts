import { Router, Request, Response } from 'express';
import { getDbConnection } from '../db/connection';
import { TestItem } from '../types';

const router = Router();

/**
 * DELETE /api/v1/test-items/:id
 * Delete a test item by ID.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = await getDbConnection();
    
    // Check if item exists
    const existingItem = await db.prepare(
      'SELECT id FROM test_items WHERE id = ?'
    ).get(id as string);

    if (!existingItem) {
      return res.status(404).json({
        error: {
          code: 'ITEM_NOT_FOUND',
          message: `Test item with id "${id}" not found`,
        },
      });
    }

    // Delete the item
    await db.prepare('DELETE FROM test_items WHERE id = ?').run(id as string);
    
    db.close();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting test item:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete test item',
      },
    });
  }
});

export default router;