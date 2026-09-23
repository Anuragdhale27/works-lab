import { describe, expect, it } from 'vitest';
import { validateResumeData } from './storage';

describe('validateResumeData', () => {
  it('accepts sample data with the awards key deleted and returns awards: []', () => {
    const sample = {
      personal: { name: 'John Doe' },
      summary: 'A summary',
      experience: [],
      // awards key is intentionally missing
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.awards).toEqual([]);
  });

  it('rejects awards: "x" (non-array)', () => {
    const sample = {
      personal: { name: 'John Doe' },
      summary: 'A summary',
      awards: 'x', // Invalid: should be array
    };
    const result = validateResumeData(sample);
    expect(result).toBeNull();
  });

  it('accepts valid awards array with multiple entries', () => {
    const sample = {
      personal: { name: 'John Doe' },
      summary: 'A summary',
      awards: [
        { title: 'Best Award', issuer: 'Some Org', year: '2023', description: 'Description' },
        { title: 'Another Award', issuer: 'Another Org', year: '2022', description: '' },
      ],
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.awards).toHaveLength(2);
    expect(result?.awards[0].title).toBe('Best Award');
  });

  it('sanitizes partial award entries and fills missing fields with empty strings', () => {
    const sample = {
      personal: { name: 'John Doe' },
      awards: [
        { title: 'Award 1' }, // Missing issuer, year, description
      ],
    };
    const result = validateResumeData(sample);
    expect(result?.awards).toHaveLength(1);
    expect(result?.awards[0]).toEqual({
      title: 'Award 1',
      issuer: '',
      year: '',
      description: '',
    });
  });
});
