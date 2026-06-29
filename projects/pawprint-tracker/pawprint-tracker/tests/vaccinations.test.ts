import request from 'supertest';
import app from '../src/app.js';

describe('Vaccination Routes', () => {
  describe('POST /api/v1/vaccinations', () => {
    it('should create a vaccination record with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/vaccinations')
        .set('Authorization', 'Bearer test-token')
        .send({
          petId: 'pet-123',
          vaccineName: 'Rabies Vaccine',
          manufacturer: 'Merck',
          lotNumber: 'LOT123456',
          administeredDate: '2024-01-15',
          administeringVet: 'Dr. Smith',
          clinicName: 'Happy Paws Clinic'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.petId).toBe('pet-123');
      expect(response.body.data.vaccineName).toBe('Rabies Vaccine');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/vaccinations')
        .set('Authorization', 'Bearer test-token')
        .send({
          petId: 'pet-123',
          vaccineName: 'Rabies Vaccine'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .post('/api/v1/vaccinations')
        .set('Authorization', 'Bearer test-token')
        .send({
          petId: 'pet-123',
          vaccineName: 'Rabies Vaccine',
          manufacturer: 'Merck',
          lotNumber: 'LOT123456',
          administeredDate: 'not-a-date',
          administeringVet: 'Dr. Smith',
          clinicName: 'Happy Paws Clinic'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/vaccinations')
        .send({
          petId: 'pet-123',
          vaccineName: 'Rabies Vaccine',
          manufacturer: 'Merck',
          lotNumber: 'LOT123456',
          administeredDate: '2024-01-15',
          administeringVet: 'Dr. Smith',
          clinicName: 'Happy Paws Clinic'
        });

      expect(response.status).toBe(401);
    });

    it('should accept optional nextDueDate field', async () => {
      const response = await request(app)
        .post('/api/v1/vaccinations')
        .set('Authorization', 'Bearer test-token')
        .send({
          petId: 'pet-123',
          vaccineName: 'Rabies Vaccine',
          manufacturer: 'Merck',
          lotNumber: 'LOT123456',
          administeredDate: '2024-01-15',
          administeringVet: 'Dr. Smith',
          clinicName: 'Happy Paws Clinic',
          nextDueDate: '2025-01-15'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nextDueDate).toBe('2025-01-15');
    });
  });
});