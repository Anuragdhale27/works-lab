import { describe, expect, it } from 'vitest';
import { duplicateEntry } from './duplication';
import { emptyResumeData, type ResumeData } from '../types/resume';

describe('duplicateEntry', () => {
  it('duplicates an entry and inserts it right after the original', () => {
    const data = {
      ...emptyResumeData,
      experience: [
        { company: 'Company A', title: 'Job A', location: 'City A', start: '2020', end: '2021', description: 'Desc A' },
        { company: 'Company B', title: 'Job B', location: 'City B', start: '2021', end: '2022', description: 'Desc B' },
      ],
    };

    const result = duplicateEntry(data, 'experience', 0);

    expect(result.experience).toHaveLength(3);
    expect(result.experience[0]).toEqual(data.experience[0]);
    expect(result.experience[1]).toEqual(data.experience[0]); // Duplicated
    expect(result.experience[2]).toEqual(data.experience[1]); // Shifted
  });

  it('returns original data when index is out of bounds (negative)', () => {
    const data = {
      ...emptyResumeData,
      awards: [{ title: 'Award 1', issuer: 'Org 1', year: '2023', description: '' }],
    };

    const result = duplicateEntry(data, 'awards', -1);
    expect(result).toEqual(data);
  });

  it('returns original data when index is out of bounds (too large)', () => {
    const data = {
      ...emptyResumeData,
      awards: [{ title: 'Award 1', issuer: 'Org 1', year: '2023', description: '' }],
    };

    const result = duplicateEntry(data, 'awards', 100);
    expect(result).toEqual(data);
  });

  it('creates a deep copy, not a reference', () => {
    const data = {
      ...emptyResumeData,
      experience: [
        { company: 'Company A', title: 'Job A', location: 'City A', start: '2020', end: '2021', description: 'Desc A' },
      ],
    };

    const result = duplicateEntry(data, 'experience', 0);
    // Modify the duplicate
    result.experience[1].company = 'Modified';

    // Original should not be modified
    expect(data.experience[0].company).toBe('Company A');
    expect(result.experience[0].company).toBe('Company A');
  });

  it('works with all array field types', () => {
    const testCases: Array<'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'> = [
      'experience',
      'education',
      'projects',
      'certifications',
      'languages',
      'awards',
    ];

    for (const fieldType of testCases) {
      const data = {
        ...emptyResumeData,
        [fieldType]: [{ a: '1' }, { b: '2' }],
      } as ResumeData;
      const result = duplicateEntry(data, fieldType as 'experience', 0);
      const resultArray = result[fieldType];
      expect((resultArray as unknown[]).length).toBe(3);
    }
  });
});
