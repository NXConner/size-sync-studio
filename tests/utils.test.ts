import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names and tailwind conflicts correctly', () => {
    const result = cn('p-2', false && 'hidden', 'p-4', undefined, 'text-sm', null, 'text-base');
    expect(result).toContain('p-4');
    expect(result).not.toContain('p-2');
    expect(result).toContain('text-base');
    expect(result).not.toContain('text-sm');
  });
});