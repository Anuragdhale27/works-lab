import { useEffect, useRef, useState } from 'react';
import type { ResumeData } from '../../types/resume';
import { SECTIONS, computeSectionStatuses, computeOverallProgress, type SectionKey } from '../../lib/completeness';
import { resolveSectionOrder } from '../../lib/sectionOrder';

interface StepNavProps {
  data: ResumeData;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function StepNav({ data, containerRef }: StepNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('workslab_rail_collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
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
  }

  const resolved = resolveSectionOrder(data);
  const sections = SECTIONS.filter((s) => resolved.includes(s.key));
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
                <span className={`step-nav-dot status-${status}`} aria-hidden="true" />
                {!isCollapsed && (
                  <>
                    <span className="step-nav-label">{s.label}</span>
                    {s.optional && <span className="step-nav-optional">optional</span>}
                  </>
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
                title={isCollapsed ? cs.title : undefined}
              >
                <span className="step-nav-dot status-partial" aria-hidden="true" />
                {!isCollapsed && <span className="step-nav-label">{cs.title}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
