import request from 'supertest';
import app from '../../src/app';

describe('POST /api/v1/test-items', () => {
  const validPayload = {
    name: 'Test Item',
    description: 'A test item for validation',
    value: 100,
    isActive: true,
  };

  beforeEach(() => {
    const dbPath = process.env.DB_PATH || '/tmp/test-app-test.db';
    try { require('fs').unlinkSync(dbPath); } catch (e) {}
  });

  describe('Success Cases', () => {
    it('should create a test item with all required fields', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(validPayload)
        .expect(201);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe(validPayload.name);
      expect(response.body.data.description).toBe(validPayload.description);
      expect(response.body.data.value).toBe(validPayload.value);
      expect(response.body.data.isActive).toBe(validPayload.isActive);
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should create a test item with default isActive when not provided', async () => {
      const payload = { ...validPayload, isActive: undefined };
      delete payload.isActive;
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(payload)
        .expect(201);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should create a test item with isActive set to false', async () => {
      const payload = { ...validPayload, isActive: false };
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(payload)
        .expect(201);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should create a test item with zero value', async () => {
      const payload = { ...validPayload, value: 0 };
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(payload)
        .expect(201);
      expect(response.body.data.value).toBe(0);
    });

    it('should create a test item with maximum safe integer value', async () => {
      const payload = { ...validPayload, value: Number.MAX_SAFE_INTEGER };
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(payload)
        .expect(201);
      expect(response.body.data.value).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ description: 'No name' })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('name');
    });

    it('should return 201 when description is missing (optional field)', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test' })
        .expect(201);
      expect(response.body.data.description).toBe('');
    });

    it('should return 201 when value is missing (optional field)', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test', description: 'Desc' })
        .expect(201);
      expect(response.body.data.value).toBe(0);
    });

    it('should return 400 when value is negative', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test', description: 'Desc', value: -1 })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when value exceeds MAX_SAFE_INTEGER', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test', description: 'Desc', value: Number.MAX_SAFE_INTEGER + 1 })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: '', description: 'Desc', value: 50 })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is empty string', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test', description: '', value: 50 })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when value is not a number', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test', description: 'Desc', value: 'not-a-number' })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Request Handling', () => {
    it('should return 400 when request body is empty object', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({})
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when request body is not an object', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send('not-an-object')
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when request body is an array', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send([{ name: 'Test' }])
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when required fields are null', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: null, description: null, value: null })
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when required fields are undefined', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: undefined, description: undefined, value: undefined })
        .expect(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Response Format', () => {
    it('should include proper Content-Type header', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(validPayload)
        .expect(201);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include proper Content-Type header on error', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({ name: '' })
        .expect(400);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include proper Content-Type header on empty body', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send({})
        .expect(400);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Database Persistence', () => {
    it('should persist the created item to database', async () => {
      const response = await request(app)
        .post('/api/v1/test-items')
        .send(validPayload)
        .expect(201);
      expect(response.body.data.id).toBeDefined();
      const getResponse = await request(app)
        .get(`/api/v1/test-items/${response.body.data.id}`)
        .expect(200);
      expect(getResponse.body.data.id).toBe(response.body.data.id);
      expect(getResponse.body.data.name).toBe(validPayload.name);
    });

    it('should persist multiple items and return unique IDs', async () => {
      const response1 = await request(app)
        .post('/api/v1/test-items')
        .send({ ...validPayload, name: 'Item 1' })
        .expect(201);
      const response2 = await request(app)
        .post('/api/v1/test-items')
        .send({ ...validPayload, name: 'Item 2' })
        .expect(201);
      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });
});
