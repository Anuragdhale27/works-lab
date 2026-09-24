import type { ResumeData, BuiltInSectionKey } from '../types/resume';

export const DEFAULT_SECTION_ORDER: BuiltInSectionKey[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
];

const BUILT_IN_KEYS = new Set(DEFAULT_SECTION_ORDER);

/**
 * Resolves the section order from resume data.
 * - Takes data.sectionOrder and drops unknown keys
 * - Drops custom: ids with no matching section
 * - Drops duplicates
 * - Appends any missing built-ins in default order
 * - Appends any missing custom sections in array order
 * Returns every built-in key exactly once and every custom section exactly once.
 */
export function resolveSectionOrder(data: ResumeData): string[] {
  const customIdMap = new Map(data.customSections.map((c) => [c.id, c]));

  const seen = new Set<string>();
  const result: string[] = [];

  // Process explicitly ordered sections
  for (const key of data.sectionOrder) {
    if (seen.has(key)) continue; // Skip duplicates

    if (BUILT_IN_KEYS.has(key as BuiltInSectionKey)) {
      result.push(key);
      seen.add(key);
    } else if (key.startsWith('custom:')) {
      const customId = key.slice(7); // Remove 'custom:' prefix
      if (customIdMap.has(customId)) {
        result.push(key);
        seen.add(key);
      }
    }
  }

  // Append missing built-ins in default order
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!seen.has(key)) {
      result.push(key);
      seen.add(key);
    }
  }

  // Append missing custom sections in array order
  for (const custom of data.customSections) {
    const key = `custom:${custom.id}`;
    if (!seen.has(key)) {
      result.push(key);
      seen.add(key);
    }
  }

  return result;
}

/**
 * Move a section in the order by one position.
 * dir: -1 to move up (earlier), 1 to move down (later)
 * Returns a new array; does not mutate the input.
 */
export function moveSection(order: string[], key: string, dir: -1 | 1): string[] {
  const index = order.indexOf(key);
  if (index < 0) return order; // Key not found

  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= order.length) return order; // Out of bounds

  const result = [...order];
  [result[index], result[newIndex]] = [result[newIndex], result[index]];
  return result;
}
