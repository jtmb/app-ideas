import { z } from "zod";

/**
 * Zod schema for study goal validation
 */
export const studyGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDurationMinutes: z.number().int().positive("Target duration must be positive"),
  actualDurationMinutes: z.number().int().nonnegative().optional(),
  completionPercentage: z.number().int().min(0).max(100).optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).optional(),
  subjectId: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type StudyGoalInput = z.infer<typeof studyGoalSchema>;
