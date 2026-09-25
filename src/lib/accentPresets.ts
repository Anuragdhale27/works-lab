// Shared accent colour presets used by the Design drawer (and anything
// else that needs to offer the same set). Colours were chosen for at
// least 4.5:1 contrast against white. "Default" clears the resume's
// custom accent (falls back to each template's own colour).
export interface AccentPreset {
  name: string;
  color: string | undefined;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'Default', color: undefined },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Teal', color: '#0f766e' },
  { name: 'Emerald', color: '#0E7A5A' },
  { name: 'Maroon', color: '#7f1d1d' },
  { name: 'Plum', color: '#5b21b6' },
  { name: 'Slate', color: '#334155' },
  { name: 'Charcoal', color: '#1f2937' },
];
