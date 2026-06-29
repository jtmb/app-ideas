import { PrismaClient } from '@prisma/client';
import type { VaccinationRecord } from '../../types/vaccination';

const prisma = new PrismaClient();

export async function seedVaccinations(): Promise<void> {
  console.log('Seeding vaccination records...');

  // Sample vaccination data for testing
  const sampleVaccinations: Omit<VaccinationRecord, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      pet_id: 'pet-001',
      vaccine_name: 'Rabies',
      date_administered: new Date('2024-01-15T10:30:00Z'),
      next_due_date: new Date('2029-01-15T10:30:00Z'),
      status: 'active',
      notes: 'Annual rabies vaccination administered by Dr. Smith',
    },
    {
      pet_id: 'pet-001',
      vaccine_name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
      date_administered: new Date('2024-02-20T14:00:00Z'),
      next_due_date: new Date('2029-02-20T14:00:00Z'),
      status: 'active',
      notes: 'Core vaccine for dogs',
    },
    {
      pet_id: 'pet-002',
      vaccine_name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
      date_administered: new Date('2024-03-10T09:15:00Z'),
      next_due_date: new Date('2029-03-10T09:15:00Z'),
      status: 'active',
      notes: 'Core vaccine for cats',
    },
    {
      pet_id: 'pet-002',
      vaccine_name: 'Rabies',
      date_administered: new Date('2024-03-10T09:30:00Z'),
      next_due_date: new Date('2029-03-10T09:30:00Z'),
      status: 'active',
      notes: 'Required by law in most jurisdictions',
    },
  ];

  for (const vaccination of sampleVaccinations) {
    await prisma.vaccination.create({
      data: vaccination,
    });
  }

  console.log('Vaccination records seeded successfully.');
}

export default seedVaccinations;