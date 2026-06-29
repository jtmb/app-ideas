import { Request, Response } from 'express';
import { Subject } from '../models/Subject';
import { createSubject } from '../services/subjectService';

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, difficultyLevel } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Name is required and must be a non-empty string' } });
      return;
    }

    if (typeof difficultyLevel !== 'number' || difficultyLevel < 1 || difficultyLevel > 5) {
      res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Difficulty level must be a number between 1 and 5' } });
      return;
    }

    const subject = await createSubject(name.trim(), description || '', difficultyLevel);

    res.status(201).json({ data: subject });
  } catch (error) {
    if (error instanceof Subject.ValidationError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create subject' } });
    }
  }
};