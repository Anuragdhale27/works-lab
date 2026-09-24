import * as fs from 'fs';
import * as path from 'path';
import { PUBLIC_ROUTES, getRouteMeta, SITE_URL } from '../src/seo/routes';
import { TEMPLATE_META_REGISTRY } from '../src/templates/meta';

const DIST_DIR = path.join(process.cwd(), 'dist');
const TEMPLATE_FILE = path.join(DIST_DIR, 'index.html');

interface HtmlMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
}

function createMetaTags(meta: HtmlMeta): string {
  const tags: string[] = [];

  // Title
  tags.push(`    <title>${escapeHtml(meta.title)}</title>`);

  // Description
  tags.push(`    <meta name="description" content="${escapeHtml(meta.description)}">`);

  // Canonical (skip if empty, e.g., for 404 page)
  if (meta.canonical) {
    tags.push(`    <link rel="canonical" href="${escapeHtml(meta.canonical)}">`);
  }

  // Robots
  tags.push(`    <meta name="robots" content="${escapeHtml(meta.robots)}">`);

  // Open Graph
  const ogTags: Record<string, string> = {
    'og:title': meta.title,
    'og:description': meta.description,
    'og:type': 'website',
    'og:site_name': 'Works Lab',
    'og:image': `${SITE_URL}/og-image.png`,
    'og:locale': 'en_IN',
  };

  // Only add og:url if canonical exists
  if (meta.canonical) {
    ogTags['og:url'] = meta.canonical;
  }

  Object.entries(ogTags).forEach(([property, content]) => {
    tags.push(`    <meta property="${property}" content="${escapeHtml(content)}">`);
  });

  // Twitter
  const twitterTags = {
    'twitter:card': 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': `${SITE_URL}/og-image.png`,
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    tags.push(`    <meta name="${name}" content="${escapeHtml(content)}">`);
  });

  return tags.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function injectMeta(html: string, routePath: string): string {
  const routeMeta = getRouteMeta(routePath);

  // Remove existing meta tags to avoid duplicates
  let cleaned = html;
  cleaned = cleaned.replace(/<title>[^<]*<\/title>/g, '');
  cleaned = cleaned.replace(/<meta\s+name="description"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta\s+name="robots"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

  // Create new meta tags
  const metaTags = createMetaTags({
    title: routeMeta.title,
    description: routeMeta.description,
    canonical: routeMeta.canonical,
    robots: routeMeta.robots || 'index, follow',
    ogTags: {},
    twitterTags: {},
  });

  // Inject after <head> opening tag
  const headMatch = cleaned.match(/<head[^>]*>/);
  if (headMatch) {
    const headTag = headMatch[0];
    return cleaned.replace(headTag, `${headTag}\n${metaTags}`);
  }

  return cleaned;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function validateSingleTag(html: string, tagRegex: RegExp, tagName: string): void {
  const matches = html.match(tagRegex);
  if (!matches || matches.length !== 1) {
    console.error(
      `ERROR: Expected exactly one ${tagName} tag in ${path.basename(html)}, found ${matches?.length || 0}`
    );
    process.exit(1);
  }
}

function generateSitemap(): string {
  const buildDate = new Date().toISOString().split('T')[0];

  const entries = PUBLIC_ROUTES.map((route) => {
    return `  <url>
    <loc>${escapeHtml(route.canonical)}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function generateJsonLd(): string {
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Works Lab',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
  };

  const website = {
    '@type': 'WebSite',
    name: 'Works Lab',
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };

  const product = {
    '@type': 'Product',
    name: 'Works Lab Resume Builder',
    description:
      'Create an ATS-friendly resume with professional resume templates designed for Indian job seekers. One-time payment, no subscription.',
    brand: {
      '@type': 'Brand',
      name: 'Works Lab',
    },
    offers: {
      '@type': 'Offer',
      price: '149',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
    },
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, website, product],
  };

  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

function main(): void {
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`ERROR: ${TEMPLATE_FILE} not found. Run 'bun run build' first.`);
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

  // Generate all route files
  const routesToRender = [
    { path: '/', outPath: 'index.html', includeJsonLd: true, includeBreadcrumb: false },
    ...PUBLIC_ROUTES.filter((r) => r.path !== '/').map((r) => ({
      path: r.path,
      outPath: `.${r.path}/index.html`,
      includeJsonLd: r.path === '/',
      includeBreadcrumb: r.path.startsWith('/template/'),
    })),
    // Add /builder route (noindex, not in sitemap)
    { path: '/builder', outPath: './builder/index.html', includeJsonLd: false, includeBreadcrumb: false },
  ];

  routesToRender.forEach(({ path: routePath, outPath, includeJsonLd, includeBreadcrumb }) => {
    let html = injectMeta(templateHtml, routePath);

    // Inject JSON-LD on homepage
    if (includeJsonLd) {
      const jsonLd = generateJsonLd();
      const jsonLdScript = `    <script type="application/ld+json">${jsonLd}</script>`;
      const headMatch = html.match(/<head[^>]*>/);
      if (headMatch) {
        html = html.replace(headMatch[0], `${headMatch[0]}\n${jsonLdScript}`);
      }
    }

    // Inject BreadcrumbList on template pages
    if (includeBreadcrumb && routePath.startsWith('/template/')) {
      const templateKey = routePath.split('/')[2];
      const templateMeta = Object.values(TEMPLATE_META_REGISTRY).find((t) => t.key === templateKey);
      if (templateMeta) {
        const breadcrumbList = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Templates',
              item: `${SITE_URL}/#templates`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: templateMeta.name,
              item: `${SITE_URL}/template/${templateKey}`,
            },
          ],
        };
        const breadcrumbJson = JSON.stringify(breadcrumbList)
          .replace(/</g, '\\u003c')
          .replace(/>/g, '\\u003e');
        const breadcrumbScript = `    <script type="application/ld+json">${breadcrumbJson}</script>`;
        const headMatch = html.match(/<head[^>]*>/);
        if (headMatch) {
          html = html.replace(headMatch[0], `${headMatch[0]}\n${breadcrumbScript}`);
        }
      }
    }

    const outFilePath = path.join(DIST_DIR, outPath);
    writeFile(outFilePath, html);
    console.log(`✓ Generated: dist/${outPath}`);

    // Validate tags (skip canonical validation for 404 and builder with no canonical)
    validateSingleTag(html, /<title>[^<]*<\/title>/g, '<title>');
    validateSingleTag(html, /<meta\s+name="description"\s+content="[^"]*">/g, '<meta description>');
    if (html.includes('<link rel="canonical"')) {
      validateSingleTag(html, /<link\s+rel="canonical"\s+href="[^"]*">/g, '<link canonical>');
    }
  });

  // Create 404.html with noindex
  let notFoundHtml = templateHtml;
  notFoundHtml = injectMeta(notFoundHtml, '/nonexistent');
  const notFoundPath = path.join(DIST_DIR, '404.html');
  writeFile(notFoundPath, notFoundHtml);
  console.log(`✓ Generated: dist/404.html (noindex fallback)`);

  // Generate sitemap.xml
  const sitemap = generateSitemap();
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  writeFile(sitemapPath, sitemap);
  console.log(`✓ Generated: dist/sitemap.xml`);

  console.log('\n✅ All routes prerendered successfully');
}

main();
