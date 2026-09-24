import { describe, it, expect } from 'vitest';
import { resolveSectionOrder, moveSection, DEFAULT_SECTION_ORDER } from './sectionOrder';
import type { ResumeData } from '../types/resume';
import { emptyResumeData } from '../types/resume';

describe('sectionOrder', () => {
  describe('resolveSectionOrder', () => {
    it('returns default order when sectionOrder is empty', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        sectionOrder: [],
      };
      expect(resolveSectionOrder(data)).toEqual(DEFAULT_SECTION_ORDER);
    });

    it('drops unknown keys from sectionOrder', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        sectionOrder: ['summary', 'unknown', 'experience'],
      };
      const result = resolveSectionOrder(data);
      expect(result).not.toContain('unknown');
      expect(result).toContain('summary');
      expect(result).toContain('experience');
    });

    it('drops custom: ids with no matching section', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        customSections: [{ id: 'volunteering', title: 'Volunteering', items: [] }],
        sectionOrder: ['experience', 'custom:volunteering', 'custom:nonexistent', 'education'],
      };
      const result = resolveSectionOrder(data);
      expect(result).toContain('custom:volunteering');
      expect(result).not.toContain('custom:nonexistent');
    });

    it('drops duplicates from sectionOrder', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        sectionOrder: ['experience', 'summary', 'experience', 'skills'],
      };
      const result = resolveSectionOrder(data);
      expect(result.filter((k) => k === 'experience')).toHaveLength(1);
    });

    it('appends missing built-ins in default order', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        sectionOrder: ['projects', 'experience'],
      };
      const result = resolveSectionOrder(data);
      // projects and experience come first, then the rest in default order
      expect(result[0]).toBe('projects');
      expect(result[1]).toBe('experience');
      // Then summary, education, skills, certifications, languages, awards
      expect(result.slice(2)).toEqual(['summary', 'education', 'skills', 'certifications', 'languages', 'awards']);
    });

    it('includes every built-in key exactly once', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        sectionOrder: [],
      };
      const result = resolveSectionOrder(data);
      for (const key of DEFAULT_SECTION_ORDER) {
        expect(result.filter((k) => k === key)).toHaveLength(1);
      }
    });

    it('includes every custom section exactly once', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        customSections: [
          { id: 'volunteering', title: 'Volunteering', items: [] },
          { id: 'awards2', title: 'Awards', items: [] },
        ],
        sectionOrder: [],
      };
      const result = resolveSectionOrder(data);
      expect(result).toContain('custom:volunteering');
      expect(result).toContain('custom:awards2');
      expect(result.filter((k) => k === 'custom:volunteering')).toHaveLength(1);
      expect(result.filter((k) => k === 'custom:awards2')).toHaveLength(1);
    });

    it('appends custom sections in array order when not in sectionOrder', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        customSections: [
          { id: 'first', title: 'First', items: [] },
          { id: 'second', title: 'Second', items: [] },
        ],
        sectionOrder: ['experience'],
      };
      const result = resolveSectionOrder(data);
      const firstIndex = result.indexOf('custom:first');
      const secondIndex = result.indexOf('custom:second');
      expect(firstIndex).toBeLessThan(secondIndex);
    });

    it('respects custom section order in sectionOrder', () => {
      const data: ResumeData = {
        ...emptyResumeData,
        customSections: [
          { id: 'first', title: 'First', items: [] },
          { id: 'second', title: 'Second', items: [] },
        ],
        sectionOrder: ['experience', 'custom:second', 'custom:first'],
      };
      const result = resolveSectionOrder(data);
      const expIndex = result.indexOf('experience');
      const secondIndex = result.indexOf('custom:second');
      const firstIndex = result.indexOf('custom:first');
      expect(expIndex).toBeLessThan(secondIndex);
      expect(secondIndex).toBeLessThan(firstIndex);
    });
  });

  describe('moveSection', () => {
    it('moves a section up (dir -1) one position', () => {
      const order = ['a', 'b', 'c'];
      const result = moveSection(order, 'b', -1);
      expect(result).toEqual(['b', 'a', 'c']);
    });

    it('moves a section down (dir 1) one position', () => {
      const order = ['a', 'b', 'c'];
      const result = moveSection(order, 'b', 1);
      expect(result).toEqual(['a', 'c', 'b']);
    });

    it('does not move if key not found', () => {
      const order = ['a', 'b', 'c'];
      const result = moveSection(order, 'd', -1);
      expect(result).toEqual(order);
    });

    it('does not move if at top boundary (up)', () => {
      const order = ['a', 'b', 'c'];
      const result = moveSection(order, 'a', -1);
      expect(result).toEqual(order);
    });

    it('does not move if at bottom boundary (down)', () => {
      const order = ['a', 'b', 'c'];
      const result = moveSection(order, 'c', 1);
      expect(result).toEqual(order);
    });

    it('does not mutate the input array', () => {
      const order = ['a', 'b', 'c'];
      const original = [...order];
      moveSection(order, 'b', -1);
      expect(order).toEqual(original);
    });
  });
});
