import { z } from 'zod';

export interface StudyGoal {
  id: string;
  userId: string;
  subjectId: string;
  targetHoursPerWeek: number;
  currentHours: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyGoalCreateInput {
  subjectId: string;
  targetHoursPerWeek: number;
}

export interface StudyGoalUpdateInput {
  targetHoursPerWeek?: number;
  currentHours?: number;
}

export const studyGoalCreateSchema = z.object({
  subjectId: z.string().uuid(),
  targetHoursPerWeek: z.number().positive().int(),
});

export const studyGoalUpdateSchema = z.object({
  targetHoursPerWeek: z.number().positive().int().optional(),
  currentHours: z.number().nonnegative().int().optional(),
});
