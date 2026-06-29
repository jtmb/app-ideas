import { z } from 'zod';
import { Species, Gender } from '../types/pet';

// Zod validation schemas for pet-related operations

export const speciesSchema = z.enum(['dog', 'cat', 'bird', 'fish', 'reptile', 'other']);

export const genderSchema = z.enum(['male', 'female', 'unknown']);

export const petCreateSchema = z.object({
  ownerId: z.string().uuid('ownerId must be a valid UUID'),
  name: z.string()
    .min(1, 'name is required')
    .max(100, 'name must not exceed 100 characters')
    .trim(),
  species: speciesSchema,
  breed: z
    .string()
    .max(100, 'breed must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  age: z
    .number()
    .min(0, 'age cannot be negative')
    .max(100, 'age seems unrealistic')
    .optional(),
  gender: genderSchema.optional(),
  weight: z
    .number()
    .min(0.01, 'weight must be greater than 0')
    .max(500, 'weight seems unrealistic')
    .optional(),
  color: z
    .string()
    .max(50, 'color must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
});

export type PetCreateInput = z.infer<typeof petCreateSchema>;

export const petUpdateSchema = petCreateSchema.partial().and(
  z.object({
    id: z.string().uuid(),
  })
);

export type PetUpdateInput = z.infer<typeof petUpdateSchema>;