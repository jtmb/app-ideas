import { Request, Response, NextFunction } from 'express';
import { StudyGoal, StudyGoalCreateInput, StudyGoalUpdateInput } from '../types';
import { StudyGoalRepository } from '../repositories/study-goal.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import { AppError, HttpCode } from '../utils/errors';

class StudyGoalsController {
  private studyGoalRepository: StudyGoalRepository;
  private subjectRepository: SubjectRepository;

  constructor() {
    this.studyGoalRepository = new StudyGoalRepository();
    this.subjectRepository = new SubjectRepository();
  }

  async createStudyGoal(
    req: Request<{}, {}, StudyGoalCreateInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { subjectId, targetHoursPerWeek } = req.body;

      // Validate input using Zod schema for target hours
      if (targetHoursPerWeek <= 0 || !Number.isInteger(targetHoursPerWeek)) {
        throw new AppError('targetHoursPerWeek must be a positive integer', HttpCode.BAD_REQUEST);
      }

      const subjectExists = await this.subjectRepository.findById(subjectId);
      if (!subjectExists) {
        throw new AppError('Subject not found', HttpCode.NOT_FOUND);
      }

      const studyGoal = await this.studyGoalRepository.create({
        subjectId,
        targetHours: targetHoursPerWeek,
      });

      res.status(HttpCode.CREATED).json(studyGoal);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to create study goal', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }

  async updateStudyGoal(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { targetHoursPerWeek, currentHours } = req.body as StudyGoalUpdateInput;

      // Validate target hours if provided
      if (targetHoursPerWeek !== undefined) {
        if (targetHoursPerWeek <= 0 || !Number.isInteger(targetHoursPerWeek)) {
          throw new AppError('targetHoursPerWeek must be a positive integer', HttpCode.BAD_REQUEST);
        }
      }

      const studyGoal = await this.studyGoalRepository.update(id, {
        targetHours: targetHoursPerWeek,
      });

      if (!studyGoal) {
        throw new AppError('Study goal not found', HttpCode.NOT_FOUND);
      }

      res.json(studyGoal);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to update study goal', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }

  async deleteStudyGoal(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const studyGoal = await this.studyGoalRepository.delete(id);

      if (!studyGoal) {
        throw new AppError('Study goal not found', HttpCode.NOT_FOUND);
      }

      res.status(HttpCode.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to delete study goal', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }

  async getStudyGoal(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const studyGoal = await this.studyGoalRepository.findById(id);

      if (!studyGoal) {
        throw new AppError('Study goal not found', HttpCode.NOT_FOUND);
      }

      res.json(studyGoal);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to retrieve study goal', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }

  async getStudyGoalsBySubject(
    req: Request<{ subjectId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { subjectId } = req.params;

      const studyGoals = await this.studyGoalRepository.findBySubject(subjectId);
      res.json(studyGoals);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to retrieve study goals', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }

  async getStudyGoalProgress(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const studyGoal = await this.studyGoalRepository.findById(id);

      if (!studyGoal) {
        throw new AppError('Study goal not found', HttpCode.NOT_FOUND);
      }

      const progressPercentage = Math.round(
        (studyGoal.currentHours / studyGoal.targetHoursPerWeek) * 100
      );

      res.json({
        id,
        targetHours: studyGoal.targetHoursPerWeek,
        completedHours: studyGoal.currentHours,
        remainingHours: studyGoal.targetHoursPerWeek - studyGoal.currentHours,
        progressPercentage,
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to retrieve study goal progress', HttpCode.INTERNAL_SERVER_ERROR));
      }
    }
  }
}

export default new StudyGoalsController();
