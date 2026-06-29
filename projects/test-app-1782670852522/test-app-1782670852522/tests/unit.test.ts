import { describe, it, expect } from 'vitest';

// Test for a simple utility function
function add(a: number, b: number): number {
  return a + b;
}

describe('add function', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should add two negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });

  it('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(-5, 0)).toBe(-5);
  });
});
