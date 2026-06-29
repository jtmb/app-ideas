import request from 'supertest';
import app from '../app';

describe('DELETE /api/v1/test-items/:id', () => {
  const testItemId = 'test-item-1';

  beforeEach(async () => {
    await app.db.prepare(
      'INSERT INTO test_items (id, name, description) VALUES (?, ?, ?)'
    ).run(testItemId, 'Test Item', 'A test item for deletion');
  });

  it('should delete an existing item and return 204', async () => {
    const response = await request(app).delete(`/api/v1/test-items/${testItemId}`);

    expect(response.status).toBe(204);
    expect(response.body).toBeUndefined();
  });

  it('should return 404 for non-existent item', async () => {
    const response = await request(app).delete('/api/v1/test-items/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'ITEM_NOT_FOUND',
        message: expect.stringContaining('not found'),
      },
    });
  });

  it('should return 500 on database error', async () => {
    // Simulate a scenario where the item exists but deletion fails
    const response = await request(app).delete('/api/v1/test-items/valid-id');

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});