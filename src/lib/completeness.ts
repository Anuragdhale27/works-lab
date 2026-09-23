import type { ResumeData } from '../types/resume';

export type SectionStatus = 'empty' | 'partial' | 'complete';

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'awards';

export interface SectionMeta {
  key: SectionKey;
  label: string;
  optional: boolean;
}

export const SECTIONS: SectionMeta[] = [
  { key: 'personal', label: 'Personal Information', optional: false },
  { key: 'summary', label: 'Professional Summary', optional: false },
  { key: 'experience', label: 'Work Experience', optional: false },
  { key: 'education', label: 'Education', optional: false },
  { key: 'skills', label: 'Skills', optional: false },
  { key: 'projects', label: 'Projects', optional: true },
  { key: 'certifications', label: 'Certifications', optional: true },
  { key: 'languages', label: 'Languages', optional: true },
  { key: 'awards', label: 'Awards & Achievements', optional: true },
];

const REQUIRED_KEYS: SectionKey[] = ['personal', 'summary', 'experience', 'education', 'skills'];

const NEXT_ACTION: Record<SectionKey, string> = {
  personal: 'Add your name, title, email and a way to reach you next.',
  summary: 'Write your professional summary next.',
  experience: 'Add your work experience next.',
  education: 'Add your education next.',
  skills: 'List a few skills next.',
  projects: 'Add a project to strengthen your resume.',
  certifications: 'Add a certification to strengthen your resume.',
  languages: 'Add a language to strengthen your resume.',
  awards: 'Add an award to strengthen your resume.',
};

function personalStatus(p: ResumeData['personal']): SectionStatus {
  const hasContact = Boolean(p.phone || p.location || p.linkedin || p.portfolio);
  const core = [p.name, p.title, p.email].filter((v) => v.trim() !== '').length;
  if (core === 3 && hasContact) return 'complete';
  if (core > 0 || hasContact) return 'partial';
  return 'empty';
}

function summaryStatus(summary: string): SectionStatus {
  const trimmed = summary.trim();
  if (!trimmed) return 'empty';
  if (trimmed.length < 40) return 'partial';
  return 'complete';
}

function experienceStatus(entries: ResumeData['experience']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some(
    (e) => e.company.trim() && e.title.trim() && e.start.trim() && e.end.trim() && e.description.trim(),
  );
  return hasComplete ? 'complete' : 'partial';
}

function educationStatus(entries: ResumeData['education']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some(
    (e) => e.degree.trim() && e.institution.trim() && e.start.trim() && e.end.trim(),
  );
  return hasComplete ? 'complete' : 'partial';
}

function skillsStatus(skills: string[]): SectionStatus {
  if (skills.length === 0) return 'empty';
  if (skills.length < 3) return 'partial';
  return 'complete';
}

function projectsStatus(entries: ResumeData['projects']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some((e) => e.name.trim() && e.tech.trim() && e.description.trim());
  return hasComplete ? 'complete' : 'partial';
}

function certificationsStatus(entries: ResumeData['certifications']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some((e) => e.name.trim() && e.org.trim() && e.year.trim());
  return hasComplete ? 'complete' : 'partial';
}

function languagesStatus(entries: ResumeData['languages']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some((e) => e.lang.trim() && e.level.trim());
  return hasComplete ? 'complete' : 'partial';
}

function awardsStatus(entries: ResumeData['awards']): SectionStatus {
  if (entries.length === 0) return 'empty';
  const hasComplete = entries.some((e) => e.title.trim() && e.issuer.trim());
  return hasComplete ? 'complete' : 'partial';
}

export function computeSectionStatuses(data: ResumeData): Record<SectionKey, SectionStatus> {
  return {
    personal: personalStatus(data.personal),
    summary: summaryStatus(data.summary),
    experience: experienceStatus(data.experience),
    education: educationStatus(data.education),
    skills: skillsStatus(data.skills),
    projects: projectsStatus(data.projects),
    certifications: certificationsStatus(data.certifications),
    languages: languagesStatus(data.languages),
    awards: awardsStatus(data.awards),
  };
}

export interface OverallProgress {
  doneCount: number;
  totalCount: number;
  percent: number;
  nextAction: string | null;
}

export function computeOverallProgress(data: ResumeData): OverallProgress {
  const statuses = computeSectionStatuses(data);
  const doneCount = REQUIRED_KEYS.filter((k) => statuses[k] === 'complete').length;
  const totalCount = REQUIRED_KEYS.length;
  const percent = Math.round((doneCount / totalCount) * 100);
  const nextKey = REQUIRED_KEYS.find((k) => statuses[k] !== 'complete');
  const nextAction = nextKey ? NEXT_ACTION[nextKey] : null;
  return { doneCount, totalCount, percent, nextAction };
}

export function isResumeDataEmpty(data: ResumeData): boolean {
  const statuses = computeSectionStatuses(data);
  return Object.values(statuses).every((s) => s === 'empty');
}
