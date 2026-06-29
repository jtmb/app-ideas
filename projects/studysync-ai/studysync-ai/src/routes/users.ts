// User routes for StudySync AI
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * POST /api/v1/users
 * Create a new user with email validation and password hashing
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    }

    // Validate email format
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } });
    }

    // Validate password strength (min 8 chars, at least one letter and one number)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters and contain both letters and numbers' } });
    }

    // Check if user already exists (simulated - in real app, query database)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'A user with this email already exists' } });
    }

    // Hash password with salt rounds (12 for security)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (simulated - in real app, insert into database)
    const userId = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = createdAt;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success response with user data and token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        createdAt,
        updatedAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON parsing error
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Invalid request body' } });
    }
    console.error('Error creating user:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } });
  }
});

/**
 * GET /api/v1/users/:id
 * Get user by ID (protected route)
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // In real app, verify authentication first
    // const authMiddleware = authenticateToken;
    // authMiddleware(req, res, () => {});

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Return user data (exclude password)
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get user' } });
  }
});

/**
 * GET /api/v1/users/me
 * Get current authenticated user (protected route)
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    // In real app, verify authentication first
    // const authMiddleware = authenticateToken;
    // authMiddleware(req, res, () => {});

    const userId = req.user?.id || 'anonymous';

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    // Return user data (exclude password)
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get current user' } });
  }
});

// Helper functions (simulated database operations)

async function getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  // Simulate database query - in real app, use PostgreSQL with pg library
  // This is a mock implementation
  return null;
}

async function getUserById(id: string): Promise<{ id: string; email: string; createdAt: Date; updatedAt: Date } | null> {
  // Simulate database query - in real app, use PostgreSQL with pg library
  // This is a mock implementation
  if (id === 'anonymous') {
    return null;
  }
  return {
    id,
    email: 'user@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default router;