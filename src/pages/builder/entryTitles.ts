import type {
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  LanguageEntry,
  AwardEntry,
  CustomItem,
} from '../../types/resume';

export interface EntryTitle {
  title: string;
  meta?: string;
}

function joinNonEmpty(parts: (string | undefined)[], sep = ' · '): string {
  return parts.filter((p) => p && p.trim()).join(sep);
}

export function experienceTitle(item: ExperienceEntry): EntryTitle {
  const title = joinNonEmpty([item.title, item.company]) || 'Untitled experience';
  const meta = joinNonEmpty([item.start, item.end], ' – ');
  return { title, meta: meta || undefined };
}

export function educationTitle(item: EducationEntry): EntryTitle {
  return { title: joinNonEmpty([item.degree, item.institution]) || 'Untitled education' };
}

export function projectTitle(item: ProjectEntry): EntryTitle {
  return { title: item.name?.trim() || 'Untitled project' };
}

export function certificationTitle(item: CertificationEntry): EntryTitle {
  return { title: joinNonEmpty([item.name, item.org]) || 'Untitled certification' };
}

export function languageTitle(item: LanguageEntry): EntryTitle {
  return { title: joinNonEmpty([item.lang, item.level]) || 'Untitled language' };
}

export function awardTitle(item: AwardEntry): EntryTitle {
  return { title: joinNonEmpty([item.title, item.issuer]) || 'Untitled award' };
}

export function customItemTitle(item: CustomItem): EntryTitle {
  return { title: joinNonEmpty([item.heading, item.subheading]) || 'Untitled item' };
}
