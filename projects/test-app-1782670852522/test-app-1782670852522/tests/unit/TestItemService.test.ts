import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestItemService } from '../../src/services/TestItemService.js';
import { testItemRepository } from '../../src/repository/test-item-repository.js';
import { validateTestItemUpdate } from '../../src/validation/test-item-update-validator.js';
import { ValidationError, NotFoundError } from '../../src/utils/errors.js';

// Mock the repository
vi.mock('../../src/repository/test-item-repository.js', () => ({
  testItemRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the validator
vi.mock('../../src/validation/test-item-update-validator.js', () => ({
  validateTestItemUpdate: vi.fn(),
}));

// Import after mocking
import { testItemRepository as mockRepo } from '../../src/repository/test-item-repository.js';
import { validateTestItemUpdate as mockValidator } from '../../src/validation/test-item-update-validator.js';

describe('TestItemService', () => {
  let service: TestItemService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TestItemService();
  });

  describe('create', () => {
    it('should create a new test item with valid data', async () => {
      const mockItem: any = {
        id: '1',
        name: 'Test Item',
        description: 'A test item',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.create.mockReturnValue(mockItem);

      const result = await service.create({
        name: 'Test Item',
        description: 'A test item',
        status: 'pending',
      });

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Test Item',
        description: 'A test item',
        status: 'pending',
        tags: [],
      });
      expect(result).toEqual(mockItem);
    });

    it('should create a new test item with default values for optional fields', async () => {
      const mockItem: any = {
        id: '2',
        name: 'Minimal Item',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.create.mockReturnValue(mockItem);

      const result = await service.create({ name: 'Minimal Item' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Minimal Item',
        description: '',
        status: 'pending',
        tags: [],
      });
      expect(result).toEqual(mockItem);
    });

    it('should throw ValidationError when name is missing', async () => {
      await expect(service.create({})).rejects.toThrow(ValidationError);
      await expect(service.create({ description: 'No name' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name is empty string', async () => {
      await expect(service.create({ name: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name contains only whitespace', async () => {
      await expect(service.create({ name: '   ' })).rejects.toThrow(ValidationError);
    });

    it('should accept valid status values', async () => {
      const mockItem: any = {
        id: '3',
        name: 'Status Test',
        description: '',
        status: 'running',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.create.mockReturnValue(mockItem);

      await expect(service.create({ name: 'Status Test', status: 'running' })).resolves.toEqual(mockItem);
      await expect(service.create({ name: 'Status Test', status: 'completed' })).resolves.toEqual(mockItem);
      await expect(service.create({ name: 'Status Test', status: 'failed' })).resolves.toEqual(mockItem);
    });

    it('should accept tags array', async () => {
      const mockItem: any = {
        id: '4',
        name: 'Tags Test',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.create.mockReturnValue(mockItem);

      await expect(service.create({ name: 'Tags Test', tags: ['tag1', 'tag2'] })).resolves.toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should update an existing test item with valid data', async () => {
      const mockExistingItem: any = {
        id: '1',
        name: 'Original Name',
        description: 'Original Description',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockUpdatedItem: any = {
        ...mockExistingItem,
        name: 'Updated Name',
        description: 'Updated Description',
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([]);
      mockRepo.update.mockReturnValue(mockUpdatedItem);

      const result = await service.update('1', {
        name: 'Updated Name',
        description: 'Updated Description',
      });

      expect(mockRepo.findById).toHaveBeenCalledWith('1');
      expect(mockValidator).toHaveBeenCalledWith({
        name: 'Updated Name',
        description: 'Updated Description',
      });
      expect(mockRepo.update).toHaveBeenCalledWith('1', {
        name: 'Updated Name',
        description: 'Updated Description',
      });
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should update only provided fields (partial update)', async () => {
      const mockExistingItem: any = {
        id: '2',
        name: 'Original Name',
        description: 'Original Description',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockUpdatedItem: any = {
        ...mockExistingItem,
        name: 'New Name',
        description: 'Original Description', // Should remain unchanged
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([]);
      mockRepo.update.mockReturnValue(mockUpdatedItem);

      const result = await service.update('2', { name: 'New Name' });

      expect(mockRepo.update).toHaveBeenCalledWith('2', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(result.description).toBe('Original Description');
    });

    it('should throw NotFoundError when item does not exist', async () => {
      mockRepo.findById.mockReturnValue(null);

      await expect(service.update('non-existent-id', { name: 'New Name' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when name is empty', async () => {
      const mockExistingItem: any = {
        id: '3',
        name: 'Original Name',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([{ field: 'name', message: 'Name cannot be empty' }]);

      await expect(service.update('3', { name: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when description exceeds maxLength', async () => {
      const mockExistingItem: any = {
        id: '4',
        name: 'Original Name',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([{ field: 'description', message: 'Description must not exceed 1000 characters' }]);

      await expect(service.update('4', { description: 'x'.repeat(1001) })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when tags array exceeds maxItems', async () => {
      const mockExistingItem: any = {
        id: '5',
        name: 'Original Name',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([{ field: 'tags', message: 'Tags must not exceed 10 items' }]);

      await expect(service.update('5', { tags: Array(11).fill('tag') })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when tags is not an array', async () => {
      const mockExistingItem: any = {
        id: '6',
        name: 'Original Name',
        description: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([{ field: 'tags', message: 'Tags must be an array' }]);

      await expect(service.update('6', { tags: 'not-an-array' })).rejects.toThrow(ValidationError);
    });

    it('should accept null description in update', async () => {
      const mockExistingItem: any = {
        id: '7',
        name: 'Original Name',
        description: 'Some Description',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockUpdatedItem: any = {
        ...mockExistingItem,
        description: null,
        updatedAt: new Date().toISOString(),
      };

      mockRepo.findById.mockReturnValue(mockExistingItem);
      mockValidator.mockReturnValue([]);
      mockRepo.update.mockReturnValue(mockUpdatedItem);

      const result = await service.update('7', { description: null });

      expect(mockRepo.update).toHaveBeenCalledWith('7', { description: null });
      expect(result.description).toBe(null);
    });
  });
});
