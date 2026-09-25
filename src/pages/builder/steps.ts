import type { ResumeData } from '../../types/resume';
import { SECTIONS, computeSectionStatuses, type SectionStatus } from '../../lib/completeness';
import { resolveSectionOrder } from '../../lib/sectionOrder';

export interface StepDef {
  /** 'personal', a built-in SectionKey, or `custom:<id>`. */
  key: string;
  label: string;
  optional: boolean;
  hint?: string;
}

const SECTION_HINTS: Partial<Record<string, string>> = {
  summary: '2–3 sentences: your role, years of experience, and the kind of work you want next.',
  experience:
    'Start each line with an action verb and include a number where you can — "Cut checkout drop-off by 18%" beats "Worked on checkout".',
  skills: 'List tools and skills a recruiter might search for. 8–12 is plenty.',
};

/**
 * The ordered list of form steps: Personal Information always first
 * (it isn't part of resolveSectionOrder, which only orders the movable
 * sections), then the resolved section order, including custom sections.
 */
export function buildSteps(data: ResumeData): StepDef[] {
  const resolved = resolveSectionOrder(data);
  const steps: StepDef[] = [{ key: 'personal', label: 'Personal Information', optional: false }];

  for (const key of resolved) {
    if (key.startsWith('custom:')) {
      const id = key.slice(7);
      const customSection = data.customSections.find((c) => c.id === id);
      steps.push({ key, label: customSection?.title?.trim() || 'Untitled section', optional: true });
      continue;
    }
    const meta = SECTIONS.find((s) => s.key === key);
    if (meta) {
      steps.push({ key: meta.key, label: meta.label, optional: meta.optional, hint: SECTION_HINTS[meta.key] });
    }
  }

  return steps;
}

export function stepStatus(step: StepDef, data: ResumeData): SectionStatus {
  if (step.key.startsWith('custom:')) {
    const id = step.key.slice(7);
    const cs = data.customSections.find((c) => c.id === id);
    if (!cs) return 'empty';
    return cs.items.length > 0 || cs.title.trim() ? 'partial' : 'empty';
  }
  const statuses = computeSectionStatuses(data);
  return statuses[step.key as keyof typeof statuses] ?? 'empty';
}
