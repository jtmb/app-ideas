import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

/**
 * Soft delete a user by ID.
 * Sets isDeleted flag to true instead of removing the record.
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Validate user exists before soft deleting
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw new AppError('USER_NOT_FOUND', 'User not found');
    }

    // Check if user is already soft deleted
    if (existingUser.isDeleted) {
      throw new AppError('USER_ALREADY_DELETED', 'User has already been deleted');
    }

    // Perform soft delete by setting isDeleted flag
    await User.softDelete(userId);

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.toJSON() });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete user' } });
    }
  }
};