// Template registry: single source of truth for metadata
// This module is React-free so it can be imported by build scripts
export interface TemplateMetadata {
  key: string;
  name: string;
  best: string;
  color: string;
  description: string;
  seoDescription: string;
  features: string[];
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
      'Modern ATS template for software and IT roles in India: bold header, clear sections, clean text for ATS parsers. Build and export for ₹149.',
    features: [
      'Bold header band with your name, title and contact details',
      'Clearly labelled standard section headings',
      'Single-column layout that parsers read top to bottom',
      'Bullet points for work experience and projects',
      'Accent colour you can change in the builder',
    ],
  },
  classic: {
    key: 'classic',
    name: 'Classic ATS',
    best: 'Corporate / Finance / Operations',
    color: '#1a1a1a',
    description:
      'A traditional, serif-based layout trusted in finance, law, and corporate environments. Conveys experience and professionalism at a glance.',
    seoDescription:
      'Classic ATS template for corporate and finance roles in India: traditional serif layout, professional design. Get it for ₹149.',
    features: [
      'Serif typography with a traditional, formal feel',
      'Standard section headings with simple rule lines',
      'Single-column layout that parsers read top to bottom',
      'Bullet points for work experience and projects',
      'Suited to corporate, finance and operations roles',
    ],
  },
  minimal: {
    key: 'minimal',
    name: 'Minimal ATS',
    best: 'Freshers / Students',
    color: '#333333',
    description:
      'A single-column, whitespace-forward layout built to parse cleanly in any ATS. Quiet and confident — ideal for freshers who want a clean resume without needing much content to fill it.',
    seoDescription:
      'Minimal ATS template for freshers and students in India: single-column, clean design, ideal for first job applications. Build and export for ₹149.',
    features: [
      'Plain, spacious single-column layout',
      'Works well when you have little work history yet',
      'Single-column layout that parsers read top to bottom',
      'Room for projects, education and skills up front',
      'Quiet styling with no graphics or icons',
    ],
  },
  executive: {
    key: 'executive',
    name: 'Executive ATS',
    best: 'Experienced Professionals',
    color: '#1c2b3a',
    description:
      'A light, premium resume designed for senior leaders. Typographic confidence and restrained detailing — a Playfair Display name, a single charcoal-navy accent — convey seniority without gimmicks.',
    seoDescription:
      'Executive ATS template for senior leaders in India: premium typography, restrained design, conveys professionalism and seniority. Build for ₹149.',
    features: [
      'Playfair Display name with restrained detailing',
      'Light layout with a single accent colour',
      'Single-column layout that parsers read top to bottom',
      'Bullet points for achievements and leadership scope',
      'Suited to senior and experienced professionals',
    ],
  },
  sidebar: {
    key: 'sidebar',
    name: 'Sidebar ATS',
    best: 'Tech / Product / Design',
    color: '#164e63',
    description:
      'A two-column layout with a narrow sidebar for contact and skills, and a spacious main column for experience. Clean and focused — perfect for technical roles where expertise shines.',
    seoDescription:
      'Sidebar ATS template for tech and design roles in India: two-column layout with skills sidebar and spacious main column. Build and export for ₹149.',
    features: [
      'Narrow left column for contact, skills and languages',
      'Wide right column for summary, experience and projects',
      'Main content comes first in the file, before the sidebar',
      'Some ATS parsers may mix the two columns; single-column templates are the safest choice',
    ],
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
    features: [
      'Full-width header band with name and contact line',
      'Main column for summary, experience and projects',
      'Side column for skills, education and certifications',
      'Some ATS parsers may mix the two columns; single-column templates are the safest choice',
    ],
  },
};
