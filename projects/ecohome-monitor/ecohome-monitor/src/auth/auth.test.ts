import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUser, loginUser, validateToken, generateToken } from './auth.service';
import type { User, RegisterInput, LoginInput } from '../types/user.types';

// Mock crypto module for token generation
vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('test-uuid'),
}));

describe('Authentication Service', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$mockhash',
    createdAt: new Date('2024-01-01'),
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(generateToken) as ReturnType<typeof vi.fn>).mockReturnValue(mockToken);
  });

  describe('registerUser', () => {
    const validRegisterInput: RegisterInput = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      vi.mocked(generateToken).mockReturnValue(mockToken);

      // Act
      const result = await registerUser(validRegisterInput);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
      expect(result.user.email).toBe(validRegisterInput.email);
      expect(result.user.name).toBe(validRegisterInput.name);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const existingUser: User = {
        ...mockUser,
        id: 'existing-user-id',
        email: validRegisterInput.email,
      };
      vi.mocked(generateToken).mockReturnValue(mockToken);

      // Act & Assert
      await expect(registerUser(validRegisterInput)).rejects.toThrow('Email already registered');
    });

    it('should throw error when password is too short', async () => {
      // Arrange
      const weakPassword: RegisterInput = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(weakPassword)).rejects.toThrow('Password must be at least 8 characters');
    });

    it('should throw error when password lacks uppercase letter', async () => {
      // Arrange
      const noUppercase: RegisterInput = {
        email: 'test@example.com',
        password: 'lowercase123!',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(noUppercase)).rejects.toThrow('Password must contain at least one uppercase letter');
    });

    it('should throw error when password lacks lowercase letter', async () => {
      // Arrange
      const noLowercase: RegisterInput = {
        email: 'test@example.com',
        password: 'UPPERCASE123!',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(noLowercase)).rejects.toThrow('Password must contain at least one lowercase letter');
    });

    it('should throw error when password lacks number', async () => {
      // Arrange
      const noNumber: RegisterInput = {
        email: 'test@example.com',
        password: 'NoNumbers!',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(noNumber)).rejects.toThrow('Password must contain at least one number');
    });

    it('should throw error when email is invalid format', async () => {
      // Arrange
      const invalidEmail: RegisterInput = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(invalidEmail)).rejects.toThrow('Invalid email format');
    });

    it('should throw error when name is empty', async () => {
      // Arrange
      const emptyName: RegisterInput = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: '',
      };

      // Act & Assert
      await expect(registerUser(emptyName)).rejects.toThrow('Name is required');
    });

    it('should throw error when email contains special characters', async () => {
      // Arrange
      const specialEmail: RegisterInput = {
        email: 'test+@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      // Act & Assert
      await expect(registerUser(specialEmail)).rejects.toThrow('Email contains invalid characters');
    });
  });
});