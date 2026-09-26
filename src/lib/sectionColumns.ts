import type { ResumeData, TemplateKey } from '../types/resume';
import { resolveSectionOrder } from './sectionOrder';

export type Column = 'main' | 'side';

/** Templates that render sections into two visually separate columns. */
const TWO_COLUMN_TEMPLATES = new Set<TemplateKey>(['sidebar', 'split']);

export function isTwoColumnTemplate(templateKey: TemplateKey): boolean {
  return TWO_COLUMN_TEMPLATES.has(templateKey);
}

/**
 * Default column for each built-in section, per two-column template. A
 * section not listed here defaults to the main column. Custom sections
 * always default to main unless overridden.
 */
const SIDEBAR_DEFAULT_SIDE = new Set(['skills', 'languages', 'certifications', 'education', 'awards']);
const SPLIT_DEFAULT_SIDE = new Set(['skills', 'education', 'certifications', 'languages', 'awards']);

function defaultColumnFor(templateKey: TemplateKey, sectionKey: string): Column {
  if (templateKey === 'sidebar') return SIDEBAR_DEFAULT_SIDE.has(sectionKey) ? 'side' : 'main';
  if (templateKey === 'split') return SPLIT_DEFAULT_SIDE.has(sectionKey) ? 'side' : 'main';
  return 'main';
}

/**
 * Resolves which column (main/side) each section belongs to for a given
 * template, honoring per-section overrides in `data.sectionColumns` (which
 * apply the same regardless of which two-column template is active) and
 * falling back to the template's own defaults otherwise.
 *
 * For single-column templates every section is returned in `main` and
 * `side` is empty — `sectionColumns` has no effect there.
 *
 * Returned arrays preserve the resolved section order (see
 * `resolveSectionOrder`) within each column.
 */
export function resolveColumns(data: ResumeData, templateKey: TemplateKey): { main: string[]; side: string[] } {
  const order = resolveSectionOrder(data);
  if (!isTwoColumnTemplate(templateKey)) {
    return { main: order, side: [] };
  }

  const main: string[] = [];
  const side: string[] = [];
  for (const key of order) {
    const override = data.sectionColumns?.[key];
    const column: Column = override === 'main' || override === 'side' ? override : defaultColumnFor(templateKey, key);
    (column === 'side' ? side : main).push(key);
  }
  return { main, side };
}

/**
 * Moves a section up/down by one position within its own column (main or
 * side), leaving the other column's relative order untouched. Returns a new
 * `sectionOrder` array (does not mutate `data`). No-op (returns the
 * resolved order unchanged) for single-column templates, or if the section
 * is already at the edge of its column.
 */
export function moveSectionInColumn(data: ResumeData, templateKey: TemplateKey, key: string, dir: -1 | 1): string[] {
  const order = resolveSectionOrder(data);
  const { main, side } = resolveColumns(data, templateKey);

  const list = main.includes(key) ? main : side.includes(key) ? side : null;
  if (!list) return order;

  const idx = list.indexOf(key);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= list.length) return order;

  const newList = [...list];
  [newList[idx], newList[newIdx]] = [newList[newIdx], newList[idx]];

  // Positions in `order` occupied by this column's sections, in order.
  const positions = order.reduce<number[]>((acc, k, i) => {
    if (list.includes(k)) acc.push(i);
    return acc;
  }, []);

  const result = [...order];
  positions.forEach((pos, i) => {
    result[pos] = newList[i];
  });
  return result;
}

/**
 * Returns a new `sectionColumns` map with `key` assigned to `column`. Pure —
 * does not mutate `data.sectionColumns`.
 */
export function setSectionColumn(data: ResumeData, key: string, column: Column): Record<string, Column> {
  return { ...(data.sectionColumns ?? {}), [key]: column };
}
