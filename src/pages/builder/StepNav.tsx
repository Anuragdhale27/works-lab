import { useEffect, useState } from 'react';
import type { ResumeData } from '../../types/resume';
import { computeOverallProgress, type SectionKey } from '../../lib/completeness';
import { buildSteps, stepStatus } from './steps';

interface StepNavProps {
  data: ResumeData;
  currentStepKey: string;
  onSelectStep: (key: string) => void;
  onAddSection: () => void;
  onReorderClick: () => void;
}

// Small, stroke-based glyphs so the collapsed rail still reads at a glance
// without pulling in an icon library.
const SECTION_ICON_PATHS: Record<SectionKey | 'custom' | 'personal', string> = {
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

function SectionIcon({ sectionKey }: { sectionKey: SectionKey | 'custom' | 'personal' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={SECTION_ICON_PATHS[sectionKey]} />
    </svg>
  );
}

export function StepNav({ data, currentStepKey, onSelectStep, onAddSection, onReorderClick }: StepNavProps) {
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

  const progress = computeOverallProgress(data);
  const steps = buildSteps(data);

  // Persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem('workslab_rail_collapsed', String(isCollapsed));
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed]);

  function handleSelect(key: string) {
    onSelectStep(key);
    // On narrower desktop widths the expanded rail overlays the form, so
    // close it back down to icons-only once a step has been picked.
    if (!isCollapsed && typeof window !== 'undefined' && window.innerWidth < 1440) {
      setIsCollapsed(true);
    }
  }

  return (
    <div className={`step-nav ${isCollapsed ? 'collapsed' : 'expanded'}`}>
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

        {/* Step list */}
        <nav className="step-nav-list" aria-label="Resume steps">
          {steps.map((step) => {
            const status = stepStatus(step, data);
            const isActive = currentStepKey === step.key;
            const iconKey = step.key.startsWith('custom:') ? 'custom' : (step.key as SectionKey | 'personal');
            return (
              <button
                key={step.key}
                type="button"
                className={`step-nav-item status-${status}${isActive ? ' active' : ''}`}
                onClick={() => handleSelect(step.key)}
                aria-current={isActive ? 'true' : undefined}
                title={isCollapsed ? step.label : undefined}
              >
                <SectionIcon sectionKey={iconKey} />
                <span className={`step-nav-dot status-${status}`} aria-hidden="true" />
                {isCollapsed ? (
                  <span className="sr-only">{step.label}</span>
                ) : (
                  <span className="step-nav-text">
                    <span className="step-nav-label">{step.label}</span>
                    {step.optional && <span className="step-nav-optional">optional</span>}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            className="step-nav-item step-nav-add"
            onClick={onAddSection}
            title={isCollapsed ? 'Add section' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {isCollapsed ? <span className="sr-only">Add section</span> : <span className="step-nav-text">+ Add section</span>}
          </button>
        </nav>

        <button type="button" className="step-nav-reorder" onClick={onReorderClick} title="Reorder sections">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          {isCollapsed ? <span className="sr-only">Reorder sections</span> : 'Reorder sections'}
        </button>
      </div>
    </div>
  );
}
