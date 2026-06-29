// Tests for user routes
import request from 'supertest';
import app from '../app';

describe('User Routes', () => {
  describe('POST /api/v1/users', () => {
    it('should create a new user with valid email and password', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('createdAt');
      expect(response.body.user).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          password: 'Short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password without letters', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          password: '12345678',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password without numbers', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          password: 'abcdefgh',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          password: 'SecurePass123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject empty body', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by ID', async () => {
      const response = await request(app)
        .get('/api/v1/users/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/nonexistent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });
  });
});