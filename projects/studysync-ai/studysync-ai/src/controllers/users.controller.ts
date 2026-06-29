import { Request, Response } from 'express';
import { getUserById, updateUser } from '../services/user.service';
import { AppError, HttpCode } from '../utils/errors';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    res.status(HttpCode.OK).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.code).json({ error: { code: error.code, message: error.message } });
    } else {
      throw error;
    }
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (!updateData.name || !updateData.email) {
      throw new AppError('Name and email are required', HttpCode.BAD_REQUEST);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      throw new AppError('Invalid email format', HttpCode.BAD_REQUEST);
    }

    const updatedUser = await updateUser(userId, updateData);

    res.status(HttpCode.OK).json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        timezone: updatedUser.timezone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.code).json({ error: { code: error.code, message: error.message } });
    } else {
      throw error;
    }
  }
};
