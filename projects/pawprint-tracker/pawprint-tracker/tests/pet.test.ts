/**
 * Unit tests for Pet entity types and validation.
 */

import { strict as assert } from 'assert';
import {
  Pet,
  PetDB,
  CreatePetInput,
  UpdatePetInput,
} from '../src/types/pet';

// Mock data for testing
const mockPet: Pet = {
  id: 'pet-123',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 5,
  owner_id: 'owner-456',
  created_at: new Date('2024-01-15T10:30:00Z'),
  updated_at: new Date('2024-06-29T14:20:00Z'),
};

const mockPetDB: PetDB = {
  id: 'pet-789',
  name: 'Luna',
  species: 'Cat',
  breed: 'Siamese',
  age: 3,
  owner_id: 'owner-456',
  created_at: new Date('2024-03-10T08:00:00Z'),
  updated_at: new Date('2024-06-29T12:00:00Z'),
};

const mockCreateInput: CreatePetInput = {
  name: 'Max',
  species: 'Dog',
  breed: 'Beagle',
  age: 2,
  owner_id: 'owner-789',
};

const mockUpdateInput: UpdatePetInput = {
  name: 'Maximus',
  age: 3,
  updated_at: new Date('2024-06-29T15:00:00Z'),
};

describe('Pet Entity Tests', () => {
  describe('Pet Interface Structure', () => {
    it('should have all required properties', () => {
      assert.strictEqual(mockPet.id, 'pet-123');
      assert.strictEqual(mockPet.name, 'Buddy');
      assert.strictEqual(mockPet.species, 'Dog');
      assert.strictEqual(mockPet.breed, 'Golden Retriever');
      assert.strictEqual(mockPet.age, 5);
      assert.strictEqual(mockPet.owner_id, 'owner-456');
      assert.ok(mockPet.created_at instanceof Date);
      assert.ok(mockPet.updated_at instanceof Date);
    });

    it('should have valid age (positive number)', () => {
      assert.ok(mockPet.age >= 0, 'Age should be non-negative');
    });

    it('should have valid owner_id format', () => {
      const ownerIdRegex = /^owner-d+$/;
      assert.strictEqual(ownerIdRegex.test(mockPet.owner_id), true);
    });
  });

  describe('PetDB Interface Structure', () => {
    it('should have all required properties matching Pet', () => {
      assert.strictEqual(mockPetDB.id, 'pet-789');
      assert.strictEqual(mockPetDB.name, 'Luna');
      assert.strictEqual(mockPetDB.species, 'Cat');
      assert.strictEqual(mockPetDB.breed, 'Siamese');
      assert.strictEqual(mockPetDB.age, 3);
      assert.strictEqual(mockPetDB.owner_id, 'owner-456');
      assert.ok(mockPetDB.created_at instanceof Date);
      assert.ok(mockPetDB.updated_at instanceof Date);
    });

    it('should have valid species values', () => {
      const validSpecies = ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Small Mammal'];
      assert.ok(validSpecies.includes(mockPetDB.species));
    });
  });

  describe('CreatePetInput Interface Structure', () => {
    it('should have all required properties for creation', () => {
      assert.strictEqual(mockCreateInput.name, 'Max');
      assert.strictEqual(mockCreateInput.species, 'Dog');
      assert.strictEqual(mockCreateInput.breed, 'Beagle');
      assert.strictEqual(mockCreateInput.age, 2);
      assert.strictEqual(mockCreateInput.owner_id, 'owner-789');
    });

    it('should validate required fields are present', () => {
      const { name, species, breed, age, owner_id } = mockCreateInput;
      assert.ok(name && name.length > 0, 'Name is required and non-empty');
      assert.ok(species && species.length > 0, 'Species is required and non-empty');
      assert.ok(breed && breed.length > 0, 'Breed is required and non-empty');
      assert.ok(age >= 0, 'Age is required and non-negative');
      assert.ok(owner_id && owner_id.length > 0, 'Owner ID is required and non-empty');
    });

    it('should validate name length constraints', () => {
      const name = mockCreateInput.name;
      assert.ok(name.length >= 1 && name.length <= 100, 'Name should be 1-100 characters');
    });
  });

  describe('UpdatePetInput Interface Structure', () => {
    it('should have optional properties extending CreatePetInput', () => {
      assert.strictEqual(mockUpdateInput.name, 'Maximus');
      assert.strictEqual(mockUpdateInput.age, 3);
      assert.ok(mockUpdateInput.updated_at instanceof Date);
    });

    it('should allow partial updates (only some fields)', () => {
      const { name, age } = mockUpdateInput;
      assert.ok(name !== undefined, 'Name can be updated');
      assert.ok(age !== undefined, 'Age can be updated');
    });

    it('should validate updated_at is a Date when provided', () => {
      assert.ok(mockUpdateInput.updated_at instanceof Date);
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate complete pet object structure', () => {
      const pet = mockPet;
      assert.strictEqual(typeof pet.id, 'string');
      assert.strictEqual(typeof pet.name, 'string');
      assert.strictEqual(typeof pet.species, 'string');
      assert.strictEqual(typeof pet.breed, 'string');
      assert.strictEqual(typeof pet.age, 'number');
      assert.strictEqual(typeof pet.owner_id, 'string');
      assert.ok(pet.created_at instanceof Date);
      assert.ok(pet.updated_at instanceof Date);
      assert.ok(pet.age >= 0 && pet.age <= 100, 'Age should be between 0 and 100');
    });

    it('should validate owner_id format consistency', () => {
      const ownerId = mockPet.owner_id;
      assert.strictEqual(ownerId.startsWith('owner-'), true);
      assert.ok(/^d+$/.test(ownerId.substring(6)), 'Owner ID should have numeric suffix');
    });

    it('should ensure created_at is before or equal to updated_at', () => {
      const pet = mockPet;
      assert.ok(pet.created_at <= pet.updated_at, 'Created at should not be after updated at');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero age (newborn)', () => {
      const newborn: Pet = {
        id: 'pet-newborn',
        name: 'Puppy',
        species: 'Dog',
        breed: 'Labrador',
        age: 0,
        owner_id: 'owner-111',
        created_at: new Date(),
        updated_at: new Date(),
      };
      assert.strictEqual(newborn.age, 0);
    });

    it('should handle maximum reasonable age', () => {
      const elderly: Pet = {
        id: 'pet-elderly',
        name: 'Senior',
        species: 'Dog',
        breed: 'Shih Tzu',
        age: 100,
        owner_id: 'owner-222',
        created_at: new Date('1924-01-01T00:00:00Z'),
        updated_at: new Date(),
      };
      assert.strictEqual(elderly.age, 100);
    });

    it('should handle short names', () => {
      const shortNamePet: Pet = {
        id: 'pet-short',
        name: 'B',
        species: 'Dog',
        breed: 'Chihuahua',
        age: 5,
        owner_id: 'owner-333',
        created_at: new Date(),
        updated_at: new Date(),
      };
      assert.strictEqual(shortNamePet.name, 'B');
    });

    it('should handle long names (within limit)', () => {
      const longName = 'This is a very long pet name that tests the maximum length constraint'.substring(0, 100);
      const longNamePet: Pet = {
        id: 'pet-long',
        name: longName,
        species: 'Dog',
        breed: 'Mixed Breed',
        age: 7,
        owner_id: 'owner-444',
        created_at: new Date(),
        updated_at: new Date(),
      };
      assert.strictEqual(longNamePet.name.length, 100);
    });
  });
});

export { mockPet, mockPetDB, mockCreateInput, mockUpdateInput };