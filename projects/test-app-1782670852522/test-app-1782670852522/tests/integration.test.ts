import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('GET /api/v1/items', () => {
    it('should return empty array when no items exist', async () => {
      const response = await request(app).get('/api/v1/items');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
