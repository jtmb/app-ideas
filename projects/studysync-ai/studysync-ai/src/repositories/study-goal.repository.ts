import { StudyGoal, StudyGoalSchema } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class StudyGoalRepository {
  async findById(id: string): Promise<StudyGoal | null> {
    const row = await prisma.studyGoal.findUnique({
      where: { id },
    });
    return row ? StudyGoalModel.fromRow(row) : null;
  }

  async create(data: { subjectId: string; targetHours: number }): Promise<StudyGoal> {
    const now = new Date();
    
    // Validate target hours - must be positive integer
    if (data.targetHours <= 0 || !Number.isInteger(data.targetHours)) {
      throw new Error('targetHours must be a positive integer');
    }

    const row = await prisma.studyGoal.create({
      data: {
        subject_id: data.subjectId,
        target_hours_per_week: data.targetHours,
        current_hours: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 7 days from now
        created_at: now,
        updated_at: now,
      },
    });

    return StudyGoalModel.fromRow(row);
  }

  async update(id: string, data: Partial<{ targetHours: number; status: 'active' | 'completed' | 'paused' }>): Promise<StudyGoal | null> {
    const now = new Date();
    
    // Validate target hours if provided
    if (data.targetHours !== undefined) {
      if (data.targetHours <= 0 || !Number.isInteger(data.targetHours)) {
        throw new Error('targetHours must be a positive integer');
      }
    }

    const row = await prisma.studyGoal.update({
      where: { id },
      data: {
        target_hours_per_week: data.targetHours,
        updated_at: now,
      },
    });

    return StudyGoalModel.fromRow(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await prisma.studyGoal.delete({
      where: { id },
    });
    return !!result;
  }

  async findBySubject(subjectId: string): Promise<StudyGoal[]> {
    const rows = await prisma.studyGoal.findMany({
      where: { subject_id: subjectId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(row => StudyGoalModel.fromRow(row));
  }

  async getAll(): Promise<StudyGoal[]> {
    const rows = await prisma.studyGoal.findMany({
      orderBy: { created_at: 'desc' },
    });
    return rows.map(row => StudyGoalModel.fromRow(row));
  }
}

export default new StudyGoalRepository();
