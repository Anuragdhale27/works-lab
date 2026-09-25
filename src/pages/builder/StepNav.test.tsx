import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createRef } from 'react';
import { StepNav } from './StepNav';
import { emptyResumeData } from '../../types/resume';

const STORAGE_KEY = 'workslab_rail_collapsed';

function renderStepNav() {
  const containerRef = createRef<HTMLDivElement>();
  const { container } = render(
    <>
      <div ref={containerRef}>
        <div className="builder-form-header" />
      </div>
      <StepNav data={emptyResumeData} containerRef={containerRef} />
    </>,
  );
  return container;
}

describe('StepNav', () => {
  beforeEach(() => {
    localStorage.clear();
    // Default test viewport (jsdom) is 1024px wide, which is below the
    // 1440px threshold used for the "start collapsed" default.
    window.innerWidth = 1440;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders expanded by default with no stored preference at wide viewports', () => {
    renderStepNav();
    const nav = document.querySelector('.step-nav');
    expect(nav).toHaveClass('expanded');
  });

  it('toggling collapse persists the state to localStorage', () => {
    renderStepNav();
    const toggle = screen.getByRole('button', { name: 'Collapse section navigator' });
    fireEvent.click(toggle);

    expect(document.querySelector('.step-nav')).toHaveClass('collapsed');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');

    const expandToggle = screen.getByRole('button', { name: 'Expand section navigator' });
    fireEvent.click(expandToggle);
    expect(document.querySelector('.step-nav')).toHaveClass('expanded');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('reads a persisted collapsed state back on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    renderStepNav();
    expect(document.querySelector('.step-nav')).toHaveClass('collapsed');
  });

  it('reads a persisted expanded state back on mount even at narrow desktop widths', () => {
    window.innerWidth = 1200;
    localStorage.setItem(STORAGE_KEY, 'false');
    renderStepNav();
    expect(document.querySelector('.step-nav')).toHaveClass('expanded');
  });

  it('defaults to collapsed with no stored preference at narrow desktop widths', () => {
    window.innerWidth = 1200;
    renderStepNav();
    expect(document.querySelector('.step-nav')).toHaveClass('collapsed');
  });

  it('always lists Personal Information first, even though it is not part of resolveSectionOrder', () => {
    renderStepNav();
    const labels = Array.from(document.querySelectorAll('.step-nav-label')).map((el) => el.textContent);
    expect(labels[0]).toBe('Personal Information');
  });
});
