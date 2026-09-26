export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  /** Downscaled JPEG data URL, empty when no photo. */
  photo: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  description: string;
}

export interface ProjectEntry {
  name: string;
  tech: string;
  url: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  org: string;
  year: string;
  url: string;
}

export interface LanguageEntry {
  lang: string;
  level: string;
}

export interface AwardEntry {
  title: string;
  issuer: string;
  year: string;
  description: string;
}

export interface CustomItem {
  heading: string;
  subheading: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export type BuiltInSectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'awards';

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  awards: AwardEntry[];
  customSections: CustomSection[];
  sectionOrder: string[];
  /**
   * Per-section override of which column (main/side) a section renders in,
   * for the two two-column templates (Sidebar, Split). Keyed by built-in
   * section key or `custom:<id>`. A section not present here uses the
   * active template's default column. Ignored by single-column templates
   * and by the Word export. See `src/lib/sectionColumns.ts`.
   */
  sectionColumns?: Record<string, 'main' | 'side'>;
  accent?: string;
}

export const emptyResumeData: ResumeData = {
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    photo: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  customSections: [],
  sectionOrder: [],
  sectionColumns: undefined,
  accent: undefined,
};

export type TemplateKey = 'modern' | 'classic' | 'minimal' | 'executive' | 'sidebar' | 'split';
