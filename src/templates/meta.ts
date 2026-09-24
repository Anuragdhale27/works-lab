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
      'Bold header that stands out to recruiters',
      'Clear section hierarchy for keyword visibility',
      'Single-column layout for guaranteed ATS parsing',
      'Optimized for technical skills and experience',
      'Clean, distraction-free design',
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
      'Traditional serif typography conveys authority',
      'Time-tested layout trusted in finance and law',
      'Single-column design for reliable ATS parsing',
      'Formal, professional presentation',
      'Emphasizes stability and experience',
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
      'Spacious, uncluttered layout builds confidence',
      'Perfect for first job applications and internships',
      'Single-column design parses in every ATS',
      'Lets your experience shine without noise',
      'Works great even with limited work history',
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
      'Premium typography projects executive presence',
      'Restrained design conveys confidence and maturity',
      'Single-column layout ensures ATS compatibility',
      'Elegant name treatment creates strong first impression',
      'Emphasizes leadership and strategic impact',
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
      'Two-column layout highlights skills and experience',
      'Organized sidebar keeps contact info accessible',
      'Spacious main column showcases your work',
      'Technical skills stand out prominently',
      'Some ATS parsers read main column only; single-column templates are safer',
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
      'Full-width header makes a strong visual impact',
      'Serif typography projects professionalism and polish',
      'Two-column layout balances experience and skills',
      'Ideal for leadership and business development roles',
      'Some ATS parsers may mix two-column layouts; single-column templates parse more reliably',
    ],
  },
};
