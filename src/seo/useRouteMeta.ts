import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta, SITE_URL } from './routes';

/**
 * Updates document meta tags based on the current route.
 * Call this once in a root layout component or App wrapper.
 */
export function useRouteMeta(): void {
  const location = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(location.pathname);

    // Update title
    document.title = meta.title;

    // Update or create description meta tag
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.canonical);

    // Update or create robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', meta.robots || 'index, follow');

    // Update Open Graph tags
    const ogTags = {
      'og:title': meta.title,
      'og:description': meta.description,
      'og:url': meta.canonical,
      'og:type': meta.ogType || 'website',
      'og:site_name': 'Works Lab',
      'og:image': `${SITE_URL}/og-image.png`,
      'og:locale': 'en_IN',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Update Twitter card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': meta.title,
      'twitter:description': meta.description,
      'twitter:image': `${SITE_URL}/og-image.png`,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, [location.pathname]);
}
