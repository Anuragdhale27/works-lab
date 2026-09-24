import type { ResumeData } from '../types/resume';

/**
 * Creates a copy of an entry at the given index and inserts it right after the original.
 * Returns the updated data structure with the duplicated entry.
 * If the index is out of bounds, returns the original data unchanged.
 */
export function duplicateEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages' | 'awards'>(
  data: ResumeData,
  key: K,
  index: number,
): ResumeData {
  const list = [...(data[key] as unknown[])];
  if (index < 0 || index >= list.length) return data;
  const copy = structuredClone(list[index]);
  list.splice(index + 1, 0, copy);
  return { ...data, [key]: list } as ResumeData;
}
