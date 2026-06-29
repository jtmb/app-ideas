import { TestItem } from '../types/index.js';
import { testItemRepository } from '../repository/test-item-repository.js';
import { validateTestItemUpdate } from '../validation/test-item-update-validator.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Service for business logic operations on test items
 */
export class TestItemService {
  /**
   * Create a new test item with validation
   */
  async create(data: Partial<TestItem>): Promise<TestItem> {
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Name is required and cannot be empty');
    }

    const newItem = testItemRepository.create({
      name: data.name,
      description: data.description || '',
      status: data.status || 'pending',
      tags: data.tags || [],
    });

    return newItem;
  }

  /**
   * Update an existing test item with validation
   */
  async update(id: string, updates: Partial<Pick<TestItem, 'name' | 'description' | 'tags'>>): Promise<TestItem> {
    // Validate input data
    const validationErrors = validateTestItemUpdate(updates);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.map(e => e.message).join(', '));
    }

    // Check if item exists
    const existingItem = testItemRepository.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`Test item with id "${id}"`);
    }

    // Perform update
    const updatedItem = testItemRepository.update(id, updates);

    if (!updatedItem) {
      throw new NotFoundError(`Test item with id "${id}"`);
    }

    return updatedItem;
  }
}

export const testItemService = new TestItemService();