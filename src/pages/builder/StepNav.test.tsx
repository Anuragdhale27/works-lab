import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StepNav } from './StepNav';
import { emptyResumeData } from '../../types/resume';

const STORAGE_KEY = 'workslab_rail_collapsed';

function renderStepNav(overrides: Partial<Parameters<typeof StepNav>[0]> = {}) {
  return render(
    <StepNav
      data={emptyResumeData}
      currentStepKey="personal"
      onSelectStep={vi.fn()}
      onAddSection={vi.fn()}
      onReorderClick={vi.fn()}
      {...overrides}
    />,
  );
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

  it('always lists Personal Information first, even though it is not part of resolveSectionOrder', () => {
    renderStepNav();
    const labels = Array.from(document.querySelectorAll('.step-nav-label')).map((el) => el.textContent);
    expect(labels[0]).toBe('Personal Information');
  });

  it('marks the current step active and jumps to a clicked step', () => {
    const onSelectStep = vi.fn();
    renderStepNav({ currentStepKey: 'summary', onSelectStep });

    expect(screen.getByRole('button', { name: /Professional Summary/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: /Personal Information/ })).not.toHaveAttribute('aria-current');

    fireEvent.click(screen.getByRole('button', { name: /Work Experience/ }));
    expect(onSelectStep).toHaveBeenCalledWith('experience');
  });

  it('offers "Add section" and "Reorder sections" actions', () => {
    const onAddSection = vi.fn();
    const onReorderClick = vi.fn();
    renderStepNav({ onAddSection, onReorderClick });

    fireEvent.click(screen.getByRole('button', { name: '+ Add section' }));
    expect(onAddSection).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Reorder sections' }));
    expect(onReorderClick).toHaveBeenCalledTimes(1);
  });
});
