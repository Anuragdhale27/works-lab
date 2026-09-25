import { useEffect, useRef, useState } from 'react';
import type { ResumeData } from '../../types/resume';
import { SECTIONS, computeSectionStatuses, computeOverallProgress, type SectionKey } from '../../lib/completeness';
import { resolveSectionOrder } from '../../lib/sectionOrder';

interface StepNavProps {
  data: ResumeData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Small, stroke-based glyphs so the collapsed rail still reads at a glance
// without pulling in an icon library.
const SECTION_ICON_PATHS: Record<SectionKey | 'custom', string> = {
  personal: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  summary: 'M5 4h11l3 3v13H5V4Zm3 6h9M8 13h9M8 16h6',
  experience: 'M4 8h16v11H4V8Zm4-3h8v3H8V5Z',
  education: 'M12 4 2 9l10 5 10-5-10-5Zm-6 8v5c2 2 10 2 12 0v-5',
  skills: 'M12 3 3 12l9 9 9-9-9-9Zm0 5v8',
  projects: 'M4 6h6l2 2h8v11H4V6Z',
  certifications: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM8 12l-2 8 6-3 6 3-2-8',
  languages: 'M4 6h9M4 10h6M13 4v3c0 4-2 7-6 8M13 21l4-9 4 9M14.5 18h5',
  awards: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM8 12l-2 8 6-3 6 3-2-8',
  custom: 'M6 4h12v16l-6-3-6 3V4Z',
};

function SectionIcon({ sectionKey }: { sectionKey: SectionKey | 'custom' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={SECTION_ICON_PATHS[sectionKey]} />
    </svg>
  );
}

export function StepNav({ data, containerRef }: StepNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('workslab_rail_collapsed');
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    } catch {
      // Ignore localStorage errors, fall through to width-based default.
    }
    // No stored preference yet: start collapsed on narrower desktop
    // screens (1024-1439px), where the expanded rail would otherwise
    // overlay the form.
    if (typeof window !== 'undefined' && window.innerWidth < 1440) {
      return true;
    }
    return false;
  });

  const [activeKey, setActiveKey] = useState<string>(SECTIONS[0].key);
  const statuses = computeSectionStatuses(data);
  const progress = computeOverallProgress(data);
  const navRef = useRef<HTMLDivElement>(null);

  // Persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem('workslab_rail_collapsed', String(isCollapsed));
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed]);

  // Track which section is currently in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolved = resolveSectionOrder(data);
    const sectionIds = resolved.map((key) => (key.startsWith('custom:') ? `section-custom-${key.slice(7)}` : `section-${key}`));

    const elements = sectionIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const headerEl = container.querySelector('.builder-form-header') as HTMLElement | null;
    const topOffset = (headerEl?.offsetHeight ?? 0) + 8;
    const bottomOffset = Math.max(0, container.clientHeight - topOffset - 120);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0].target.id.replace('section-', '').replace('custom-', '');
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

  function goToSection(key: string, isCustom = false) {
    const container = containerRef.current;
    const sectionId = isCustom ? `section-custom-${key}` : `section-${key}`;
    const el = document.getElementById(sectionId);
    if (!container || !el) return;
    const headerEl = container.querySelector('.builder-form-header') as HTMLElement | null;
    const offset = headerEl ? headerEl.offsetHeight + 12 : 12;
    const top = el.offsetTop - offset;
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setActiveKey(key);
    // On narrower desktop widths the expanded rail overlays the form, so
    // close it back down to icons-only once a section has been picked.
    if (!isCollapsed && typeof window !== 'undefined' && window.innerWidth < 1440) {
      setIsCollapsed(true);
    }
  }

  const resolved = resolveSectionOrder(data);
  // Personal Information always comes first: it isn't part of
  // resolveSectionOrder (which only orders the movable sections), so it
  // has to be added back in rather than filtered against `resolved`.
  const personalSection = SECTIONS.find((s) => s.key === 'personal');
  const otherSections = SECTIONS.filter((s) => s.key !== 'personal' && resolved.includes(s.key));
  const sections = personalSection ? [personalSection, ...otherSections] : otherSections;
  const customSections = data.customSections
    .filter((cs) => resolved.includes(`custom:${cs.id}`));

  return (
    <div className={`step-nav ${isCollapsed ? 'collapsed' : 'expanded'}`} ref={navRef}>
      <button
        className="step-nav-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand section navigator' : 'Collapse section navigator'}
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? '»' : '«'}
      </button>

      <div className="step-nav-content">
        {/* Progress summary */}
        <div className="step-nav-progress">
          <div className="progress-ring-wrapper">
            <svg className="progress-ring" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="progress-ring-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-ring-fill"
                style={{
                  strokeDasharray: `${(progress.percent / 100) * 2 * Math.PI * 45} 999`,
                }}
              />
            </svg>
            <span className="progress-ring-text">{progress.doneCount}</span>
          </div>
          <div className="progress-label">
            of {progress.totalCount}
            <div className="progress-sublabel">essentials</div>
          </div>
        </div>

        {/* Section list */}
        <nav className="step-nav-list" aria-label="Resume sections">
          {sections.map((s) => {
            const status = statuses[s.key as SectionKey];
            const isActive = activeKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                className={`step-nav-item status-${status}${isActive ? ' active' : ''}`}
                onClick={() => goToSection(s.key)}
                aria-current={isActive ? 'true' : undefined}
                title={isCollapsed ? s.label : undefined}
              >
                <SectionIcon sectionKey={s.key} />
                <span className={`step-nav-dot status-${status}`} aria-hidden="true" />
                {isCollapsed ? (
                  <span className="sr-only">{s.label}</span>
                ) : (
                  <span className="step-nav-text">
                    <span className="step-nav-label">{s.label}</span>
                    {s.optional && <span className="step-nav-optional">optional</span>}
                  </span>
                )}
              </button>
            );
          })}

          {customSections.map((cs) => {
            const isActive = activeKey === cs.id;
            return (
              <button
                key={cs.id}
                type="button"
                className={`step-nav-item status-partial${isActive ? ' active' : ''}`}
                onClick={() => goToSection(cs.id, true)}
                aria-current={isActive ? 'true' : undefined}
                title={isCollapsed ? (cs.title || 'Untitled section') : undefined}
              >
                <SectionIcon sectionKey="custom" />
                <span className="step-nav-dot status-partial" aria-hidden="true" />
                {isCollapsed ? (
                  <span className="sr-only">{cs.title || 'Untitled section'}</span>
                ) : (
                  <span className="step-nav-label">{cs.title || 'Untitled section'}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
