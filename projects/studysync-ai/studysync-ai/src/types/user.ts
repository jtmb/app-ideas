// User type definitions for StudySync AI
import { Request } from 'express';

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request with user context
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
