import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('adds numbers (TDD sanity)', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(1, 2)).toBe(3);
  });
});
