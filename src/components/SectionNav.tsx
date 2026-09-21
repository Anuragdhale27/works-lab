import { useEffect, useRef, useState } from 'react';
import type { ResumeData } from '../types/resume';
import { SECTIONS, computeSectionStatuses, type SectionStatus } from '../lib/completeness';

const STATUS_LABEL: Record<SectionStatus, string> = {
  empty: 'Not started',
  partial: 'In progress',
  complete: 'Complete',
};

interface SectionNavProps {
  data: ResumeData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function SectionNav({ data, containerRef }: SectionNavProps) {
  const statuses = computeSectionStatuses(data);
  const [activeKey, setActiveKey] = useState<string>(SECTIONS[0].key);
  const navRef = useRef<HTMLDivElement>(null);

  // Track which section is currently in view within the form panel's own
  // scroll container (not the window).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = SECTIONS.map((s) => document.getElementById(`section-${s.key}`)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const headerEl = container.querySelector('.builder-form-header') as HTMLElement | null;
    // The sticky header covers the top of the scroll container, so a
    // section only reads as "in view" once it clears that band. Use pixel
    // margins keyed to the header's real height rather than percentages,
    // which drift as content length varies.
    const topOffset = (headerEl?.offsetHeight ?? 0) + 8;
    const bottomOffset = Math.max(0, container.clientHeight - topOffset - 120);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0].target.id.replace('section-', '');
        setActiveKey(id);
      },
      {
        root: container,
        rootMargin: `-${topOffset}px 0px -${bottomOffset}px 0px`,
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef, data]);

  function goToSection(key: string) {
    const container = containerRef.current;
    const el = document.getElementById(`section-${key}`);
    if (!container || !el) return;
    const headerEl = container.querySelector('.builder-form-header') as HTMLElement | null;
    const offset = headerEl ? headerEl.offsetHeight + 12 : 12;
    const top = el.offsetTop - offset;
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setActiveKey(key);
  }

  return (
    <nav className="section-nav" aria-label="Resume sections" ref={navRef}>
      {SECTIONS.map((s) => {
        const status = statuses[s.key];
        const isActive = activeKey === s.key;
        return (
          <button
            key={s.key}
            type="button"
            className={`section-nav-item status-${status}${isActive ? ' active' : ''}`}
            onClick={() => goToSection(s.key)}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className={`section-nav-dot status-${status}`} aria-hidden="true" />
            <span className="section-nav-label">{s.label}</span>
            {s.optional && <span className="section-nav-optional">optional</span>}
            <span className="sr-only">{STATUS_LABEL[status]}</span>
          </button>
        );
      })}
    </nav>
  );
}
