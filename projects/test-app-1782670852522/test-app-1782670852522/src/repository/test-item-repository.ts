import { TestItem } from '../types/index.js';

/**
 * Repository for test item data access layer
 * Implements CRUD operations for test items using an in-memory array
 */
export class TestItemRepository {
  private items: TestItem[] = [];

  /**
   * Find a test item by its ID
   */
  findById(id: string): TestItem | null {
    const item = this.items.find((item) => item.id === id);
    return item || null;
  }

  /**
   * Create a new test item
   */
  create(item: Omit<TestItem, 'createdAt'>): TestItem {
    const newItem: TestItem = {
      ...item,
      createdAt: new Date().toISOString(),
    };
    this.items.push(newItem);
    return newItem;
  }

  /**
   * Update an existing test item with partial data
   * Only provided fields will be updated (partial update)
   */
  update(id: string, updates: Partial<Pick<TestItem, 'name' | 'description' | 'tags'>>): TestItem | null {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    // Perform partial update - only update provided fields
    if (updates.name !== undefined) {
      this.items[index].name = updates.name;
    }
    if (updates.description !== undefined) {
      this.items[index].description = updates.description;
    }
    if (updates.tags !== undefined) {
      this.items[index].tags = updates.tags;
    }

    // Update timestamp
    this.items[index].updatedAt = new Date().toISOString();

    return this.items[index];
  }

  /**
   * Delete a test item by ID
   */
  delete(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  /**
   * Get all test items
   */
  findAll(): TestItem[] {
    return [...this.items];
  }
}

export const testItemRepository = new TestItemRepository();
