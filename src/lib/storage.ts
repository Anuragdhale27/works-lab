import { emptyResumeData, type ResumeData } from '../types/resume';
import { DEFAULT_SECTION_ORDER } from './sectionOrder';

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
  'customSections',
  'sectionOrder',
  'sectionColumns',
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
  'customSections',
  'sectionOrder',
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

function generateCustomSectionId(): string {
  // Use a simple counter-based approach for deterministic IDs
  // In a real app, you might use crypto.randomUUID().slice(0, 8)
  return `custom_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeCustomSections(value: unknown) {
  if (!Array.isArray(value)) return [];
  const usedIds = new Set<string>();
  const result: Array<{ id: string; title: string; items: Array<{ heading: string; subheading: string; date: string; description: string }> }> = [];

  for (const section of value) {
    if (!isPlainObject(section)) continue;

    let id = section.id as unknown;
    // Validate or generate ID
    if (typeof id !== 'string' || !id.match(/^[a-z0-9-]{1,40}$/i)) {
      id = generateCustomSectionId();
    }
    // Avoid duplicate IDs
    while (usedIds.has(id as string)) {
      id = generateCustomSectionId();
    }
    usedIds.add(id as string);

    const title = typeof section.title === 'string' ? section.title : '';
    const items = sanitizeEntryArray(section.items, {
      heading: '',
      subheading: '',
      date: '',
      description: '',
    });

    result.push({ id: id as string, title, items });
  }

  return result;
}

const BUILT_IN_SECTION_KEYS = new Set<string>(DEFAULT_SECTION_ORDER);

/**
 * Sanitizes `sectionColumns`: keeps only entries whose key is a known
 * built-in section or a `custom:<id>` key whose section actually exists
 * (in the already-sanitized `customSections`), and whose value is exactly
 * 'main' or 'side'. Everything else — unknown keys, bad values, dangling
 * custom ids — is dropped silently. Returns undefined when nothing valid
 * remains, so old data saved before this field existed still loads fine.
 */
function sanitizeSectionColumns(
  value: unknown,
  customSections: Array<{ id: string }>
): Record<string, 'main' | 'side'> | undefined {
  if (!isPlainObject(value)) return undefined;
  const customIds = new Set(customSections.map((c) => c.id));
  const result: Record<string, 'main' | 'side'> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (raw !== 'main' && raw !== 'side') continue;
    if (BUILT_IN_SECTION_KEYS.has(key)) {
      result[key] = raw;
    } else if (key.startsWith('custom:') && customIds.has(key.slice(7))) {
      result[key] = raw;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
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
  if (raw.sectionColumns !== undefined && !isPlainObject(raw.sectionColumns)) return null;
  for (const field of ARRAY_FIELDS) {
    if (raw[field] !== undefined && !Array.isArray(raw[field])) return null;
  }

  const personalRaw = isPlainObject(raw.personal) ? raw.personal : {};
  const stringField = (v: unknown) => (typeof v === 'string' ? v : '');

  // Validate accent: must be a valid hex color (#RRGGBB)
  const accentRaw = stringField(raw.accent);
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(accentRaw);
  const accent = isValidHex ? accentRaw : undefined;

  const customSections = sanitizeCustomSections(raw.customSections);

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
    customSections,
    sectionOrder: sanitizeStringArray(raw.sectionOrder),
    sectionColumns: sanitizeSectionColumns(raw.sectionColumns, customSections),
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
