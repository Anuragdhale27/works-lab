import { emptyResumeData, type ResumeData } from '../types/resume';

export const RESUME_STORAGE_KEY = 'workslab_resume_data';

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

export function saveResumeData(data: ResumeData): void {
  try {
    window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently skip persistence.
  }
}
