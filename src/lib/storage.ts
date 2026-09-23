import { emptyResumeData, type ResumeData } from '../types/resume';

export const RESUME_STORAGE_KEY = 'workslab_resume_data';

const KNOWN_TOP_LEVEL_KEYS = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
  'accent',
] as const;

const ARRAY_FIELDS = [
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'awards',
] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function sanitizeEntryArray<T extends Record<string, string>>(value: unknown, shape: T): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlainObject).map((item) => {
    const out = { ...shape };
    for (const key of Object.keys(shape) as Array<keyof T>) {
      const raw = item[key as string];
      out[key] = (typeof raw === 'string' ? raw : '') as T[keyof T];
    }
    return out;
  });
}

/**
 * Validates and sanitizes data coming from an imported .json file. Returns
 * null when the shape is not recognizably a resume export — callers should
 * surface an error and never fall back to blindly trusting the input.
 *
 * A field that is present but the wrong *type* (e.g. `experience` being a
 * string instead of an array) is treated as a sign the whole file is
 * corrupt/hand-edited and rejects the import, rather than silently
 * discarding that field.
 */
export function validateResumeData(raw: unknown): ResumeData | null {
  if (!isPlainObject(raw)) return null;
  if (!KNOWN_TOP_LEVEL_KEYS.some((k) => k in raw)) return null;
  if (raw.personal !== undefined && !isPlainObject(raw.personal)) return null;
  if (raw.summary !== undefined && typeof raw.summary !== 'string') return null;
  for (const field of ARRAY_FIELDS) {
    if (raw[field] !== undefined && !Array.isArray(raw[field])) return null;
  }

  const personalRaw = isPlainObject(raw.personal) ? raw.personal : {};
  const stringField = (v: unknown) => (typeof v === 'string' ? v : '');

  // Validate accent: must be a valid hex color (#RRGGBB)
  const accentRaw = stringField(raw.accent);
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(accentRaw);
  const accent = isValidHex ? accentRaw : undefined;

  return {
    personal: {
      name: stringField(personalRaw.name),
      title: stringField(personalRaw.title),
      email: stringField(personalRaw.email),
      phone: stringField(personalRaw.phone),
      location: stringField(personalRaw.location),
      linkedin: stringField(personalRaw.linkedin),
      portfolio: stringField(personalRaw.portfolio),
      // Only accept inline images so an imported file cannot point the preview at a remote URL.
      photo: /^data:image\/(jpeg|png|webp);base64,/.test(stringField(personalRaw.photo)) ? stringField(personalRaw.photo) : '',
    },
    summary: stringField(raw.summary),
    experience: sanitizeEntryArray(raw.experience, {
      company: '', title: '', location: '', start: '', end: '', description: '',
    }),
    education: sanitizeEntryArray(raw.education, {
      degree: '', institution: '', location: '', start: '', end: '', description: '',
    }),
    skills: sanitizeStringArray(raw.skills),
    projects: sanitizeEntryArray(raw.projects, { name: '', tech: '', url: '', description: '' }),
    certifications: sanitizeEntryArray(raw.certifications, { name: '', org: '', year: '', url: '' }),
    languages: sanitizeEntryArray(raw.languages, { lang: '', level: '' }),
    awards: sanitizeEntryArray(raw.awards, { title: '', issuer: '', year: '', description: '' }),
    accent,
  };
}

export function loadResumeData(): ResumeData {
  try {
    const saved = window.localStorage.getItem(RESUME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Shallow-merge onto the default shape so older/partial saved data
      // (e.g. from before a field was added) never crashes a renderer.
      return {
        ...emptyResumeData,
        ...parsed,
        personal: { ...emptyResumeData.personal, ...(parsed.personal ?? {}) },
      };
    }
  } catch {
    // localStorage unavailable or corrupt data — fall back to empty state.
  }
  return emptyResumeData;
}

export function saveResumeData(data: ResumeData): boolean {
  try {
    window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    // Storage full or unavailable (quota exceeded, private browsing, etc).
    return false;
  }
}
