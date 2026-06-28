import { describe, it, expect } from 'vitest';
import { MODIFICATION_COSTS, REQUIRED_LEVELS } from '@/lib/types';

describe('Game constants', () => {
  it('MODIFICATION_COSTS has correct values', () => {
    expect(MODIFICATION_COSTS.firstSlot).toBe(250);
  });
  it('REQUIRED_LEVELS has correct values', () => {
    expect(REQUIRED_LEVELS.firstSlot).toBe(3);
  });
});
