import { useEffect } from 'react';

/** Reveals elements with the `.fade-in` class as they scroll into view,
 * mirroring the original site's IntersectionObserver-based effect. */
export function useFadeIn(deps: unknown[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in:not(.visible)');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
