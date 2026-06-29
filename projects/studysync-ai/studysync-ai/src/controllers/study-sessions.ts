import { Request, Response, NextFunction } from 'express';
import { studySessionSchema, studySessionResponseSchema, CreateStudySessionInput, StudySession } from '../types/study-session';
import { SubjectRepository } from '../repositories/subject-repository';
import { StudySessionRepository } from '../repositories/study-session-repository';

export const createStudySession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = req.body as CreateStudySessionInput;

    // Validate input using Zod schema
    const validatedData = studySessionSchema.parse(input);

    // Check if subject exists
    const subjectRepository = new SubjectRepository();
    const subject = await subjectRepository.findById(validatedData.subjectId);

    if (!subject) {
      res.status(404).json({
        error: {
          code: 'SUBJECT_NOT_FOUND',
          message: `Subject with id ${validatedData.subjectId} not found`,
        },
      });
      return;
    }

    // Create study session
    const studySessionRepository = new StudySessionRepository();
    const studySession: StudySession = await studySessionRepository.create({
      subjectId: validatedData.subjectId,
      durationMinutes: validatedData.durationMinutes,
      date: validatedData.date,
      notes: validatedData.notes,
    });

    // Return created study session
    res.status(201).json(studySessionResponseSchema.parse(studySession));
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
      return;
    }

    next(error);
  }
};