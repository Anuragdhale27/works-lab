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

  it('accepts a valid hex accent color #RRGGBB', () => {
    const sample = {
      personal: { name: 'John Doe' },
      accent: '#7f1d1d',
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.accent).toBe('#7f1d1d');
  });

  it('rejects an invalid accent color (e.g. "red")', () => {
    const sample = {
      personal: { name: 'John Doe' },
      accent: 'red',
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.accent).toBeUndefined();
  });

  it('rejects an invalid hex accent color with wrong length (e.g. "#12")', () => {
    const sample = {
      personal: { name: 'John Doe' },
      accent: '#12',
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.accent).toBeUndefined();
  });

  it('loads old data without accent field and returns undefined', () => {
    const sample = {
      personal: { name: 'John Doe' },
      summary: 'A summary',
      // accent intentionally missing
    };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.accent).toBeUndefined();
  });

  it('loads old data without a sectionColumns field and returns undefined', () => {
    const sample = { personal: { name: 'John Doe' }, summary: 'A summary' };
    const result = validateResumeData(sample);
    expect(result).not.toBeNull();
    expect(result?.sectionColumns).toBeUndefined();
  });

  it('rejects sectionColumns that is not an object (e.g. a string)', () => {
    const sample = { personal: { name: 'John Doe' }, sectionColumns: 'side' };
    expect(validateResumeData(sample)).toBeNull();
  });

  it('keeps valid sectionColumns entries for built-in and existing custom sections', () => {
    const sample = {
      personal: { name: 'John Doe' },
      customSections: [{ id: 'volunteering', title: 'Volunteering', items: [] }],
      sectionColumns: {
        education: 'main',
        awards: 'side',
        'custom:volunteering': 'side',
      },
    };
    const result = validateResumeData(sample);
    expect(result?.sectionColumns).toEqual({
      education: 'main',
      awards: 'side',
      'custom:volunteering': 'side',
    });
  });

  it('drops sectionColumns entries with an unknown key, a bad value, or a dangling custom id', () => {
    const sample = {
      personal: { name: 'John Doe' },
      customSections: [],
      sectionColumns: {
        education: 'side',
        notARealSection: 'side',
        skills: 'diagonal',
        'custom:missing': 'main',
      },
    };
    const result = validateResumeData(sample);
    expect(result?.sectionColumns).toEqual({ education: 'side' });
  });

  it('drops sectionColumns entirely when every entry is invalid, returning undefined', () => {
    const sample = {
      personal: { name: 'John Doe' },
      sectionColumns: { notARealSection: 'side' },
    };
    const result = validateResumeData(sample);
    expect(result?.sectionColumns).toBeUndefined();
  });
});
