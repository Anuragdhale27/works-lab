import type { ComponentType } from 'react';
import type { ResumeData, TemplateKey } from '../types/resume';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';

export interface TemplateMeta {
  key: TemplateKey;
  name: string;
  best: string;
  color: string;
  description: string;
  Component: ComponentType<{ data: ResumeData }>;
}

// Single source of truth for the 4 resume templates: the builder's live
// preview, the landing page's template gallery, and the template detail
// page all render from this registry instead of hand-duplicated markup.
export const TEMPLATES: Record<TemplateKey, TemplateMeta> = {
  modern: {
    key: 'modern',
    name: 'Modern ATS',
    best: 'Software / IT / Tech',
    color: '#1e3a5f',
    description:
      'A clean, structured resume with a bold header and clear section hierarchy. Built for tech roles where clarity and keywords matter most.',
    Component: ModernTemplate,
  },
  classic: {
    key: 'classic',
    name: 'Classic ATS',
    best: 'Corporate / Finance / Operations',
    color: '#1a1a1a',
    description:
      'A traditional, serif-based layout trusted in finance, law, and corporate environments. Conveys experience and professionalism at a glance.',
    Component: ClassicTemplate,
  },
  minimal: {
    key: 'minimal',
    name: 'Minimal ATS',
    best: 'Freshers / Students',
    color: '#333333',
    description:
      'A single-column, whitespace-forward layout built to parse cleanly in any ATS. Quiet and confident — ideal for freshers who want a clean resume without needing much content to fill it.',
    Component: MinimalTemplate,
  },
  executive: {
    key: 'executive',
    name: 'Executive ATS',
    best: 'Experienced Professionals',
    color: '#1c2b3a',
    description:
      'A light, premium resume designed for senior leaders. Typographic confidence and restrained detailing — a Playfair Display name, a single charcoal-navy accent — convey seniority without gimmicks.',
    Component: ExecutiveTemplate,
  },
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];

export function isTemplateKey(key: string | undefined): key is TemplateKey {
  return !!key && key in TEMPLATES;
}
