import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  getInitials,
  getServiceColor,
  getStatusColor,
  formatTime,
} from '../utils';

describe('cn', () => {
  it('merges simple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('handles undefined and null inputs', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });
});

describe('formatCurrency', () => {
  it('formats whole numbers as USD', () => {
    expect(formatCurrency(1500)).toBe('$1,500');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    expect(formatDate('2026-06-15')).toBe('Jun 15, 2026');
  });

  it('returns original string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('getInitials', () => {
  it('extracts two initials from a full name', () => {
    expect(getInitials('John Smith')).toBe('JS');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('limits to two characters', () => {
    expect(getInitials('John Michael Smith')).toBe('JM');
  });

  it('uppercases initials', () => {
    expect(getInitials('john smith')).toBe('JS');
  });
});

describe('getServiceColor', () => {
  it('returns correct class for mowing', () => {
    const result = getServiceColor('mowing');
    expect(result).toContain('bg-green-100');
    expect(result).toContain('text-green-800');
  });

  it('returns correct class for emergency', () => {
    const result = getServiceColor('emergency');
    expect(result).toContain('bg-red-100');
    expect(result).toContain('text-red-800');
  });

  it('returns fallback for unknown type', () => {
    const result = getServiceColor('unknown' as any);
    expect(result).toContain('bg-gray-100');
  });
});

describe('getStatusColor', () => {
  it('returns blue for scheduled', () => {
    const result = getStatusColor('scheduled');
    expect(result).toContain('bg-blue-100');
    expect(result).toContain('text-blue-800');
  });

  it('returns green for completed', () => {
    const result = getStatusColor('completed');
    expect(result).toContain('bg-green-100');
  });

  it('returns green for active', () => {
    const result = getStatusColor('active');
    expect(result).toContain('bg-green-100');
  });

  it('returns fallback for unknown status', () => {
    const result = getStatusColor('xyz');
    expect(result).toContain('bg-gray-100');
  });
});

describe('formatTime', () => {
  it('formats HH:mm to 12-hour format', () => {
    expect(formatTime('08:00')).toBe('8:00 AM');
  });

  it('formats PM times', () => {
    expect(formatTime('14:30')).toBe('2:30 PM');
  });

  it('formats midnight as 12:00 AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('returns original string for invalid input', () => {
    expect(formatTime('bad')).toBe('bad');
  });
});
