// Template registry: single source of truth for metadata
// This module is React-free so it can be imported by build scripts
export interface TemplateMetadata {
  key: string;
  name: string;
  best: string;
  color: string;
  description: string;
  seoDescription: string;
}

export const TEMPLATE_META_REGISTRY: Record<string, TemplateMetadata> = {
  modern: {
    key: 'modern',
    name: 'Modern ATS',
    best: 'Software / IT / Tech',
    color: '#1e3a5f',
    description:
      'A clean, structured resume with a bold header and clear section hierarchy. Built for tech roles where clarity and keywords matter most.',
    seoDescription:
      'Modern ATS resume template for software and IT roles in India: bold header, clear sections, clean text for ATS parsers. Build and export for ₹149, no subscription.',
  },
  classic: {
    key: 'classic',
    name: 'Classic ATS',
    best: 'Corporate / Finance / Operations',
    color: '#1a1a1a',
    description:
      'A traditional, serif-based layout trusted in finance, law, and corporate environments. Conveys experience and professionalism at a glance.',
    seoDescription:
      'Classic ATS resume template for corporate, finance, and legal roles in India: traditional serif layout, professional design, ATS-safe. Build and export for ₹149.',
  },
  minimal: {
    key: 'minimal',
    name: 'Minimal ATS',
    best: 'Freshers / Students',
    color: '#333333',
    description:
      'A single-column, whitespace-forward layout built to parse cleanly in any ATS. Quiet and confident — ideal for freshers who want a clean resume without needing much content to fill it.',
    seoDescription:
      'Minimal ATS resume template for freshers and students in India: single-column, clean design, ideal for first job applications. Build and export for ₹149, no subscription.',
  },
  executive: {
    key: 'executive',
    name: 'Executive ATS',
    best: 'Experienced Professionals',
    color: '#1c2b3a',
    description:
      'A light, premium resume designed for senior leaders. Typographic confidence and restrained detailing — a Playfair Display name, a single charcoal-navy accent — convey seniority without gimmicks.',
    seoDescription:
      'Executive ATS resume template for senior leaders and experienced professionals in India: premium typography, restrained design, conveys seniority. Build for ₹149.',
  },
  sidebar: {
    key: 'sidebar',
    name: 'Sidebar ATS',
    best: 'Tech / Product / Design',
    color: '#164e63',
    description:
      'A two-column layout with a narrow sidebar for contact and skills, and a spacious main column for experience. Clean and focused — perfect for technical roles where expertise shines.',
    seoDescription:
      'Sidebar ATS resume template for tech, product, and design roles in India: two-column layout, skills sidebar, spacious experience section. Build and export for ₹149.',
  },
  split: {
    key: 'split',
    name: 'Split ATS',
    best: 'Business / Marketing / Sales',
    color: '#3d3d3d',
    description:
      'A two-column design with a full-width header and serif typography. Main column for experience, side column for skills. Professional and polished for leadership and creative roles.',
    seoDescription:
      'Split ATS resume template for business, marketing, and sales roles in India: two-column design, serif header, polished layout for leaders. Build for ₹149.',
  },
};
