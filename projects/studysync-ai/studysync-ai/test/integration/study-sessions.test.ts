/**
 * Integration tests for study session CRUD endpoints
 */

import request from 'supertest';
import app, { pool } from '../../src/server';
import { SubjectRepository } from '../../src/repositories/subject-repository';

const createTestSubject = async (): Promise<string> => {
  const subjectRepo = new SubjectRepository();
  const subject = await subjectRepo.create({
    name: 'Test Subject',
    description: 'Test subject for integration tests',
  });
  return subject.id;
};

const cleanupTestSubjects = async () => {
  const subjectRepo = new SubjectRepository();
  const subjects = await subjectRepo.findAll();
  for (const subject of subjects) {
    if (subject.name === 'Test Subject') {
      await subjectRepo.delete(subject.id);
    }
  }
};

beforeAll(async () => {
  console.log('Setting up integration tests...');
});

afterAll(async () => {
  console.log('Cleaning up after integration tests...');
  await cleanupTestSubjects();
  await pool.end();
});

describe('Study Session Routes', () => {
  let testSubjectId: string;

  beforeAll(async () => {
    testSubjectId = await createTestSubject();
    console.log(`Created test subject with ID: ${testSubjectId}`);
  });

  describe('POST /api/v1/study-sessions', () => {
    it('should create a new study session with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 60,
          date: new Date().toISOString(),
          notes: 'Test study session',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('subjectId', testSubjectId);
      expect(response.body).toHaveProperty('durationMinutes', 60);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('notes', 'Test study session');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should reject creation without subjectId', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          durationMinutes: 60,
          date: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject creation with invalid subjectId (non-existent)', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: 'non-existent-subject-id',
          durationMinutes: 60,
          date: new Date().toISOString(),
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('SUBJECT_NOT_FOUND');
    });

    it('should reject creation with invalid durationMinutes (zero)', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 0,
          date: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional notes field', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 45,
          date: new Date().toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes', null);
    });

    it('should accept empty notes field', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 30,
          date: new Date().toISOString(),
          notes: '',
        })
        .expect(201);

      expect(response.body).toHaveProperty('notes', '');
    });
  });

  describe('GET /api/v1/study-sessions/:id', () => {
    let studySessionId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 60,
          date: new Date().toISOString(),
          notes: 'Session for GET tests',
        })
        .expect(201);

      studySessionId = response.body.id;
    });

    it('should return study session by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/study-sessions/${studySessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', studySessionId);
      expect(response.body).toHaveProperty('subjectId', testSubjectId);
      expect(response.body).toHaveProperty('durationMinutes', 60);
      expect(response.body).toHaveProperty('notes', 'Session for GET tests');
    });

    it('should return 404 for non-existent study session', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for empty ID', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions/')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/study-sessions/:id', () => {
    let studySessionId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 60,
          date: new Date().toISOString(),
          notes: 'Original notes',
        })
        .expect(201);

      studySessionId = response.body.id;
    });

    it('should update study session with valid data', async () => {
      const response = await request(app)
        .put(`/api/v1/study-sessions/${studySessionId}`)
        .send({
          durationMinutes: 90,
          notes: 'Updated notes',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.durationMinutes).toBe(90);
      expect(response.body.data.notes).toBe('Updated notes');
    });

    it('should reject update with invalid durationMinutes', async () => {
      const response = await request(app)
        .put(`/api/v1/study-sessions/${studySessionId}`)
        .send({
          durationMinutes: -30,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update for non-existent study session', async () => {
      const response = await request(app)
        .put('/api/v1/study-sessions/non-existent-id')
        .send({
          durationMinutes: 60,
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow partial updates (only notes)', async () => {
      const response = await request(app)
        .put(`/api/v1/study-sessions/${studySessionId}`)
        .send({
          notes: 'Only updated notes',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.notes).toBe('Only updated notes');
    });

    it('should allow partial updates (only durationMinutes)', async () => {
      const response = await request(app)
        .put(`/api/v1/study-sessions/${studySessionId}`)
        .send({
          durationMinutes: 45,
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.durationMinutes).toBe(45);
    });
  });

  describe('DELETE /api/v1/study-sessions/:id', () => {
    let studySessionId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: testSubjectId,
          durationMinutes: 60,
          date: new Date().toISOString(),
          notes: 'Session to delete',
        })
        .expect(201);

      studySessionId = response.body.id;
    });

    it('should delete study session successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/study-sessions/${studySessionId}`)
        .expect(204);

      expect(response.body).toBeUndefined();
    });

    it('should return 404 for deleting non-existent study session', async () => {
      const response = await request(app)
        .delete('/api/v1/study-sessions/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for deleting with empty ID', async () => {
      const response = await request(app)
        .delete('/api/v1/study-sessions/')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for invalid subjectId in create', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send({
          subjectId: 'invalid-subject-id-12345',
          durationMinutes: 60,
          date: new Date().toISOString(),
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('SUBJECT_NOT_FOUND');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send('not json at all')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions/unknown-method')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
