import { PrismaClient } from '@prisma/client';
import type { VaccinationRecord, CreateVaccinationRecordInput, UpdateVaccinationRecordInput } from '../types/vaccination';

const prisma = new PrismaClient();

export class VaccinationRepository {
  async findById(id: string): Promise<VaccinationRecord | null> {
    return prisma.vaccination.findUnique({
      where: { id },
    });
  }

  async findByPetId(petId: string): Promise<VaccinationRecord[]> {
    return prisma.vaccination.findMany({
      where: { pet_id: petId },
      orderBy: { date_administered: 'desc' },
    });
  }

  async findAll(): Promise<VaccinationRecord[]> {
    return prisma.vaccination.findMany({
      orderBy: { date_administered: 'desc' },
    });
  }

  async create(input: CreateVaccinationRecordInput): Promise<VaccinationRecord> {
    return prisma.vaccination.create({
      data: {
        pet_id: input.pet_id,
        vaccine_name: input.vaccine_name,
        date_administered: input.date_administered,
        next_due_date: input.next_due_date ?? null,
        status: input.status ?? 'active',
        notes: input.notes ?? null,
      },
    });
  }

  async update(id: string, input: UpdateVaccinationRecordInput): Promise<VaccinationRecord | null> {
    const allowedFields = [
      'pet_id',
      'vaccine_name',
      'date_administered',
      'next_due_date',
      'status',
      'notes',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (input[field] !== undefined) {
        updateData[field] = input[field];
      }
    }

    return prisma.vaccination.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.vaccination.delete({
      where: { id },
    });
  }

  async getExpiredVaccinations(): Promise<VaccinationRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.vaccination.findMany({
      where: {
        status: 'active',
        next_due_date: { lte: today },
      },
      orderBy: { next_due_date: 'asc' },
    });
  }

  async getUpcomingVaccinations(limit: number = 10): Promise<VaccinationRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.vaccination.findMany({
      where: {
        status: 'active',
        next_due_date: { gte: today },
      },
      take: limit,
      orderBy: { next_due_date: 'asc' },
    });
  }
}

export const vaccinationRepository = new VaccinationRepository();