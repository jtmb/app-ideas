import { Subject } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SubjectRepository {
  async findById(id: string): Promise<Subject | null> {
    const subject = await prisma.subject.findUnique({
      where: { id },
    });
    return subject;
  }

  async getAll(): Promise<Subject[]> {
    const subjects = await prisma.subject.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return subjects;
  }
}

export default new SubjectRepository();
