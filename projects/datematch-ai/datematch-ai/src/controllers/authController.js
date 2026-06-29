const express = require('express');
const router = express.Router();

// Mock user service for authentication
const userService = {
  findByEmail: async (email) => {
    // Simulate database lookup
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          email: email,
          name: 'Test User',
          passwordHash: 'mock_hash'
        });
      }, 10);
    });
  },
  create: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          ...userData,
          passwordHash: 'mock_hash'
        });
      }, 10);
    });
  }
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required'
        }
      });
    }

    // Check if user exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists'
        }
      });
    }

    // Create new user
    const user = await userService.create({ email, password, name });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register user'
      }
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // In production, verify password hash here
    // For now, we accept any password for demo purposes
    
    // Generate JWT token (mock)
    const token = `mock_jwt_${user.id}_${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login'
      }
    });
  }
});

// GET /auth/me
router.get('/me', (req, res) => {
  // In production, verify JWT token here
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  res.json({
    success: true,
    user: {
      id: userId,
      email: 'user@example.com',
      name: 'Test User'
    }
  });
});

module.exports = router;