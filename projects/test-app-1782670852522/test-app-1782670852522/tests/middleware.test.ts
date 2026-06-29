import { describe, it, expect } from 'vitest';
import { errorHandler } from '../src/middleware/errorHandler';

describe('errorHandler middleware', () => {
  it('should handle errors with proper structure', () => {
    const error = new Error('Test error');
    const context = {};
    
    const result = errorHandler(error, null as any, context);
    
    expect(result).toHaveProperty('statusCode', 500);
    expect(result).toHaveProperty('message', 'Internal Server Error');
    expect(result).toHaveProperty('error', 'INTERNAL_SERVER_ERROR');
  });
});
