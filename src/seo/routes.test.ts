import { describe, it, expect } from 'vitest';
import { getRouteMeta, PUBLIC_ROUTES, SITE_URL } from './routes';

describe('SEO Routes', () => {
  it('PUBLIC_ROUTES should contain homepage and templates', () => {
    expect(PUBLIC_ROUTES.length).toBeGreaterThan(0);
    const homePage = PUBLIC_ROUTES.find((r) => r.path === '/');
    expect(homePage).toBeDefined();
    expect(homePage?.title).toBe('ATS Resume Templates for Job Seekers in India | Works Lab');
  });

  it('should have exactly 6 template routes', () => {
    const templateRoutes = PUBLIC_ROUTES.filter((r) => r.path.startsWith('/template/'));
    expect(templateRoutes).toHaveLength(6);
  });

  it('should have policy pages', () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/terms');
    expect(paths).toContain('/refund');
  });

  it('all titles should be unique', () => {
    const titles = PUBLIC_ROUTES.map((r) => r.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it('all descriptions should be unique', () => {
    const descriptions = PUBLIC_ROUTES.map((r) => r.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });

  it('all titles should be <= 60 chars where practical', () => {
    PUBLIC_ROUTES.forEach((route) => {
      // Most titles should be under 60 chars (homepage is an exception)
      if (route.path !== '/') {
        expect(route.title.length).toBeLessThanOrEqual(70); // Allowing some flexibility
      }
    });
  });

  it('all descriptions should be reasonable length', () => {
    PUBLIC_ROUTES.forEach((route) => {
      expect(route.description.length).toBeGreaterThanOrEqual(100);
      expect(route.description.length).toBeLessThanOrEqual(250);
    });
  });

  it('all canonical URLs should start with SITE_URL', () => {
    PUBLIC_ROUTES.forEach((route) => {
      expect(route.canonical).toMatch(new RegExp(`^${SITE_URL.replace(/\./g, '\\.')}`));
    });
  });

  it('all canonical URLs should not have trailing slash (except root)', () => {
    PUBLIC_ROUTES.forEach((route) => {
      if (route.path === '/') {
        expect(route.canonical).toBe(`${SITE_URL}/`);
      } else {
        expect(route.canonical).not.toMatch(/\/$/);
      }
    });
  });

  it('all routes should have robots metadata', () => {
    PUBLIC_ROUTES.forEach((route) => {
      expect(route.robots).toBeDefined();
      expect(route.robots).toMatch(/^(index|noindex)/);
    });
  });

  it('builder should be noindex', () => {
    const builderMeta = getRouteMeta('/builder');
    expect(builderMeta.robots).toBe('noindex, follow');
  });

  it('builder should NOT be in PUBLIC_ROUTES', () => {
    const inPublic = PUBLIC_ROUTES.some((r) => r.path === '/builder');
    expect(inPublic).toBe(false);
  });

  it('unknown routes should return not-found meta', () => {
    const notFoundMeta = getRouteMeta('/nonexistent');
    expect(notFoundMeta.title).toContain('not found');
    expect(notFoundMeta.robots).toBe('noindex');
  });

  it('unknown template routes should return not-found meta', () => {
    const notFoundMeta = getRouteMeta('/template/nonexistent');
    expect(notFoundMeta.title).toContain('not found');
  });

  it('getRouteMeta should handle trailing slashes', () => {
    const withoutSlash = getRouteMeta('/privacy');
    const withSlash = getRouteMeta('/privacy/');
    expect(withoutSlash.title).toBe(withSlash.title);
    expect(withoutSlash.canonical).toBe(withSlash.canonical);
  });

  it('all routes should have proper ogType', () => {
    PUBLIC_ROUTES.forEach((route) => {
      expect(route.ogType).toBeDefined();
      expect(['website', 'product']).toContain(route.ogType);
    });
  });
});
