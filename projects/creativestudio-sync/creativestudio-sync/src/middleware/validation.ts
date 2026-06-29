// Validation middleware for comment inputs
import { Request, Response, NextFunction } from 'express';

export interface CommentInput {
  content: string;
  parentId?: string;
}

export const validateCommentInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.body || typeof req.body.content !== 'string') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content is required and must be a string',
        },
      });
    }

    if (req.body.content.length < 1 || req.body.content.length > 10000) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content must be between 1 and 10000 characters',
        },
      });
    }

    if (req.body.content.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Content cannot be empty or whitespace only',
        },
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Validation failed',
      },
    });
  }
};