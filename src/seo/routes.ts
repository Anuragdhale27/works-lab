// SEO metadata for all routes - React-free module for build scripts
import { TEMPLATE_META_REGISTRY } from '../templates/meta';

export const SITE_URL = 'https://resume.workslab.in';
export const PRODUCT_PRICE = 149;

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogType?: string;
}

// Homepage title and description
const HOME_TITLE = 'ATS Resume Templates for Job Seekers in India | Works Lab';
const HOME_DESCRIPTION =
  'Create an ATS-friendly resume with professional resume templates designed for Indian job seekers. Build and export your resume for ₹149, no subscription.';

const PUBLIC_ROUTES_LIST: RouteMeta[] = [
  {
    path: '/',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: `${SITE_URL}/`,
    robots: 'index, follow',
    ogType: 'website',
  },
  // Template pages
  ...Object.values(TEMPLATE_META_REGISTRY).map((template) => ({
    path: `/template/${template.key}`,
    title: `${template.name} Resume Template | Works Lab`,
    description: template.seoDescription,
    canonical: `${SITE_URL}/template/${template.key}`,
    robots: 'index, follow',
    ogType: 'website',
  })),
  {
    path: '/privacy',
    title: 'Privacy Policy | Works Lab',
    description:
      'Works Lab does not collect or transmit your resume data. All information stays locally in your browser and is never sent to any server.',
    canonical: `${SITE_URL}/privacy`,
    robots: 'index, follow',
    ogType: 'website',
  },
  {
    path: '/terms',
    title: 'Terms of Service | Works Lab',
    description:
      'Works Lab provides resume templates for personal job use. The ₹149 fee grants access to the builder and download features.',
    canonical: `${SITE_URL}/terms`,
    robots: 'index, follow',
    ogType: 'website',
  },
  {
    path: '/refund',
    title: 'Refund Policy | Works Lab',
    description:
      'If you experience technical issues within 7 days of purchase, contact adwork895@gmail.com and we will work to resolve it.',
    canonical: `${SITE_URL}/refund`,
    robots: 'index, follow',
    ogType: 'website',
  },
];

// Builder is not indexed
const BUILDER_ROUTE: RouteMeta = {
  path: '/builder',
  title: 'Resume Builder | Works Lab',
  description: 'Build your ATS-friendly resume using Works Lab resume builder.',
  canonical: `${SITE_URL}/builder`,
  robots: 'noindex, follow',
};

// Not found page
const NOT_FOUND_ROUTE: RouteMeta = {
  path: '/404',
  title: 'Page not found | Works Lab',
  description: 'The page you are looking for does not exist. Browse our resume templates instead.',
  canonical: '',
  robots: 'noindex',
};

export const PUBLIC_ROUTES = PUBLIC_ROUTES_LIST;

export function getRouteMeta(path: string): RouteMeta {
  // Normalize path: remove trailing slash except for root
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

  // Find exact match
  const route = PUBLIC_ROUTES_LIST.find((r) => r.path === normalizedPath);
  if (route) return route;

  // Special case for builder
  if (normalizedPath === '/builder') return BUILDER_ROUTE;

  // Unknown routes
  return NOT_FOUND_ROUTE;
}
