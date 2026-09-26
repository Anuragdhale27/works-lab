import { describe, expect, it } from 'vitest';
import { emptyResumeData } from '../types/resume';
import { isTwoColumnTemplate, moveSectionInColumn, resolveColumns, setSectionColumn } from './sectionColumns';

describe('isTwoColumnTemplate', () => {
  it('is true only for sidebar and split', () => {
    expect(isTwoColumnTemplate('sidebar')).toBe(true);
    expect(isTwoColumnTemplate('split')).toBe(true);
    expect(isTwoColumnTemplate('modern')).toBe(false);
    expect(isTwoColumnTemplate('classic')).toBe(false);
    expect(isTwoColumnTemplate('minimal')).toBe(false);
    expect(isTwoColumnTemplate('executive')).toBe(false);
  });
});

describe('resolveColumns', () => {
  it('puts everything in main for single-column templates, ignoring sectionColumns', () => {
    const data = { ...emptyResumeData, sectionColumns: { skills: 'side' as const } };
    const { main, side } = resolveColumns(data, 'modern');
    expect(side).toEqual([]);
    expect(main).toContain('skills');
  });

  it('uses Sidebar defaults: main keeps summary/experience/projects, side gets skills/languages/certifications/education/awards', () => {
    const { main, side } = resolveColumns(emptyResumeData, 'sidebar');
    expect(main).toEqual(['summary', 'experience', 'projects']);
    expect(side).toEqual(['education', 'skills', 'certifications', 'languages', 'awards']);
  });

  it('uses Split defaults: main keeps summary/experience/projects, side gets skills/education/certifications/languages/awards', () => {
    const { main, side } = resolveColumns(emptyResumeData, 'split');
    expect(main).toEqual(['summary', 'experience', 'projects']);
    expect(side).toEqual(['education', 'skills', 'certifications', 'languages', 'awards']);
  });

  it('a custom section defaults to main for both two-column templates', () => {
    const data = { ...emptyResumeData, customSections: [{ id: 'c1', title: 'Volunteering', items: [] }] };
    expect(resolveColumns(data, 'sidebar').main).toContain('custom:c1');
    expect(resolveColumns(data, 'split').main).toContain('custom:c1');
  });

  it('an override moves a section to the other column and applies to both two-column templates', () => {
    const data = { ...emptyResumeData, sectionColumns: { education: 'main' as const, projects: 'side' as const } };
    for (const template of ['sidebar', 'split'] as const) {
      const { main, side } = resolveColumns(data, template);
      expect(main).toContain('education');
      expect(side).toContain('projects');
      expect(side).not.toContain('education');
      expect(main).not.toContain('projects');
    }
  });

  it('keeps resolved section order within each column', () => {
    const data = { ...emptyResumeData, sectionOrder: ['awards', 'skills', 'summary', 'experience'] };
    const { main, side } = resolveColumns(data, 'sidebar');
    expect(main).toEqual(['summary', 'experience', 'projects']);
    expect(side.indexOf('awards')).toBeLessThan(side.indexOf('skills'));
  });
});

describe('moveSectionInColumn', () => {
  it('behaves like a normal single-column reorder when there is only one column', () => {
    // Default order: summary, experience, education, skills, ... — moving
    // skills up swaps it with the section immediately before it.
    const order = moveSectionInColumn(emptyResumeData, 'modern', 'skills', -1);
    expect(order.indexOf('skills')).toBeLessThan(order.indexOf('education'));
  });

  it('moves a section up within its column without disturbing the other column', () => {
    // Sidebar side column default order: education, skills, certifications, languages, awards
    const newOrder = moveSectionInColumn(emptyResumeData, 'sidebar', 'certifications', -1);
    const data = { ...emptyResumeData, sectionOrder: newOrder };
    const { main, side } = resolveColumns(data, 'sidebar');
    expect(side).toEqual(['education', 'certifications', 'skills', 'languages', 'awards']);
    expect(main).toEqual(['summary', 'experience', 'projects']);
  });

  it('does not move past the start or end of its column', () => {
    const order = resolveColumns(emptyResumeData, 'sidebar');
    const atStart = moveSectionInColumn(emptyResumeData, 'sidebar', order.side[0], -1);
    expect(resolveColumns({ ...emptyResumeData, sectionOrder: atStart }, 'sidebar').side).toEqual(order.side);

    const atEnd = moveSectionInColumn(emptyResumeData, 'sidebar', order.main[order.main.length - 1], 1);
    expect(resolveColumns({ ...emptyResumeData, sectionOrder: atEnd }, 'sidebar').main).toEqual(order.main);
  });

  it('moving a section within one column leaves the other column completely unchanged, including order', () => {
    const data = { ...emptyResumeData, sectionOrder: ['awards', 'education', 'summary', 'projects', 'experience', 'skills'] };
    const before = resolveColumns(data, 'split');
    const newOrder = moveSectionInColumn(data, 'split', 'awards', 1);
    const after = resolveColumns({ ...data, sectionOrder: newOrder }, 'split');
    expect(after.main).toEqual(before.main);
  });
});

describe('setSectionColumn', () => {
  it('adds an override without mutating the original sectionColumns object', () => {
    const original = { skills: 'main' as const };
    const data = { ...emptyResumeData, sectionColumns: original };
    const result = setSectionColumn(data, 'education', 'side');
    expect(result).toEqual({ skills: 'main', education: 'side' });
    expect(original).toEqual({ skills: 'main' });
  });

  it('works when sectionColumns is undefined', () => {
    expect(setSectionColumn(emptyResumeData, 'skills', 'side')).toEqual({ skills: 'side' });
  });

  it('overwrites an existing override for the same key', () => {
    const data = { ...emptyResumeData, sectionColumns: { skills: 'side' as const } };
    expect(setSectionColumn(data, 'skills', 'main')).toEqual({ skills: 'main' });
  });
});
