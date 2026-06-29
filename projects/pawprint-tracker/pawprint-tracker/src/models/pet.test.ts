import { describe, it, expect, beforeEach } from 'vitest';
import { Pet, createPet, getPetById, updatePet, deletePet, listPets } from './pet';

describe('Pet CRUD Operations', () => {
  let mockPets: Map<number, Pet>;
  let nextId: number;

  beforeEach(() => {
    mockPets = new Map();
    nextId = 1;
  });

  describe('createPet', () => {
    it('should create a pet with all required fields', () => {
      const result = createPet({
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        ownerId: 1,
        createdAt: new Date('2024-01-01'),
      });

      expect(result).toBeInstanceOf(Pet);
      expect(result.name).toBe('Buddy');
      expect(result.species).toBe('Dog');
      expect(result.breed).toBe('Golden Retriever');
      expect(result.age).toBe(3);
      expect(result.ownerId).toBe(1);
      expect(mockPets.has(nextId)).toBe(true);
    });

    it('should auto-generate unique ID', () => {
      const pet1 = createPet({
        name: 'Max',
        species: 'Cat',
        breed: 'Siamese',
        age: 2,
        ownerId: 1,
      });

      const pet2 = createPet({
        name: 'Luna',
        species: 'Dog',
        breed: 'Beagle',
        age: 1,
        ownerId: 1,
      });

      expect(pet1.id).toBe(nextId);
      expect(pet2.id).toBe(nextId + 1);
    });

    it('should throw error when name is missing', () => {
      expect(() => createPet({
        species: 'Dog',
        breed: 'Labrador',
        age: 5,
        ownerId: 1,
      })).toThrow('Name is required');
    });

    it('should throw error when species is missing', () => {
      expect(() => createPet({
        name: 'Fluffy',
        breed: 'Persian',
        age: 4,
        ownerId: 1,
      })).toThrow('Species is required');
    });

    it('should throw error when ownerId is missing', () => {
      expect(() => createPet({
        name: 'Rocky',
        species: 'Dog',
        breed: 'Poodle',
        age: 6,
      })).toThrow('Owner ID is required');
    });

    it('should throw error when age is negative', () => {
      expect(() => createPet({
        name: 'Oldie',
        species: 'Dog',
        breed: 'Husky',
        age: -1,
        ownerId: 1,
      })).toThrow('Age must be non-negative');
    });

    it('should throw error when age is not a number', () => {
      expect(() => createPet({
        name: 'Test',
        species: 'Dog',
        breed: 'Mix',
        age: 'five',
        ownerId: 1,
      })).toThrow('Age must be a number');
    });
  });

  describe('getPetById', () => {
    const testPet = createPet({
      name: 'Charlie',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 4,
      ownerId: 1,
    });

    beforeEach(() => {
      mockPets.set(testPet.id, testPet);
    });

    it('should return pet when ID exists', () => {
      const result = getPetById(testPet.id);
      expect(result).toBe(testPet);
    });

    it('should return null when ID does not exist', () => {
      const result = getPetById(999);
      expect(result).toBeNull();
    });

    it('should return null for negative ID', () => {
      const result = getPetById(-1);
      expect(result).toBeNull();
    });
  });

  describe('updatePet', () => {
    const testPet = createPet({
      name: 'Daisy',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 3,
      ownerId: 1,
    });

    beforeEach(() => {
      mockPets.set(testPet.id, testPet);
    });

    it('should update pet name', () => {
      const updated = updatePet(testPet.id, { name: 'Daisy Updated' });
      expect(updated.name).toBe('Daisy Updated');
      expect(mockPets.get(testPet.id)?.name).toBe('Daisy Updated');
    });

    it('should update pet age', () => {
      const updated = updatePet(testPet.id, { age: 5 });
      expect(updated.age).toBe(5);
    });

    it('should return null when pet not found', () => {
      const result = updatePet(999, { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should allow updating all fields at once', () => {
      const updated = updatePet(testPet.id, {
        name: 'Updated Name',
        breed: 'Updated Breed',
        age: 7,
      });
      expect(updated.name).toBe('Updated Name');
      expect(updated.breed).toBe('Updated Breed');
      expect(updated.age).toBe(7);
    });

    it('should not allow updating ownerId (security)', () => {
      const updated = updatePet(testPet.id, { ownerId: 999 });
      expect(updated.ownerId).toBe(testPet.ownerId);
    });

    it('should throw error when name is empty after update', () => {
      expect(() => updatePet(testPet.id, { name: '' })).toThrow('Name cannot be empty');
    });
  });

  describe('deletePet', () => {
    const testPet = createPet({
      name: 'Spike',
      species: 'Dog',
      breed: 'Rottweiler',
      age: 5,
      ownerId: 1,
    });

    beforeEach(() => {
      mockPets.set(testPet.id, testPet);
    });

    it('should delete pet and return true', () => {
      const result = deletePet(testPet.id);
      expect(result).toBe(true);
      expect(mockPets.has(testPet.id)).toBe(false);
    });

    it('should return false when pet not found', () => {
      const result = deletePet(999);
      expect(result).toBe(false);
    });

    it('should return false for negative ID', () => {
      const result = deletePet(-1);
      expect(result).toBe(false);
    });
  });
});