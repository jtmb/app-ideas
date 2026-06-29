import { Router, Request, Response } from 'express';
import { StudySessionModel as StudySession } from '../models/StudySession';
import { validateStudySessionUpdate } from '../validators/study-session.validator';

const router = Router();

/**
 * PUT /api/v1/study-sessions/:id
 * Update a study session
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input
    const validationErrors = validateStudySessionUpdate(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: validationErrors
        }
      });
    }

    // Find and update the study session
    const updatedSession = await StudySession.update(id, updateData);

    if (!updatedSession) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Study session not found'
        }
      });
    }

    // Return 200 with updated resource (not 204 since we're returning data)
    res.status(200).json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error updating study session:', error);

    if (error instanceof StudySession.ValidationError) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: error.details
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update study session'
      }
    });
  }
});

/**
 * DELETE /api/v1/study-sessions/:id
 * Delete a study session
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete the study session
    const deletedSession = await StudySession.delete(id);

    if (!deletedSession) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Study session not found'
        }
      });
    }

    // Return 204 No Content for successful deletion
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting study session:', error);

    if (error instanceof StudySession.ValidationError) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid study session ID',
          details: error.details
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete study session'
      }
    });
  }
});

export default router;
