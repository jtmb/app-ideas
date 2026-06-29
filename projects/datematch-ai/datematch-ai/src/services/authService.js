/**
 * Authentication Service - Handles authentication logic
 */

const crypto = require('crypto');

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  /**
   * Hash password using bcrypt
   */
  hashPassword(password, saltRounds = 10) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        crypto.randomBytes(16),
        saltRounds,
        32,
        'sha512',
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(derivedKey.toString('hex'));
          }
        }
      );
    });
  }

  /**
   * Verify password against hash
   */
  verifyPassword(password, passwordHash) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        crypto.randomBytes(16),
        10,
        32,
        'sha512',
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            const hash = derivedKey.toString('hex');
            resolve(hash === passwordHash);
          }
        }
      );
    });
  }

  /**
   * Register a new user
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('USER_EXISTS');
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password);

    // Create user
    const user = this.userModel.create({
      ...userData,
      passwordHash
    });

    return user;
  }

  /**
   * Login user and generate token
   */
  async login(email, password) {
    // Find user
    const user = this.userModel.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate JWT token (mock implementation)
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  /**
   * Generate mock JWT token
   */
  generateToken(userId) {
    const payload = {
      userId,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iat: Math.floor(Date.now() / 1000)
    };

    return `mock_jwt_${userId}_${Date.now()}`;
  }

  /**
   * Verify token (mock implementation)
   */
  verifyToken(token) {
    if (!token || !token.startsWith('mock_jwt_')) {
      return null;
    }

    const parts = token.split('_');
    if (parts.length < 3) {
      return null;
    }

    return {
      userId: parts[1],
      isValid: true
    };
  }
}

module.exports = new AuthService(new (require('../models/userModel'))());