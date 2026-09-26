import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionOrderDialog } from './SectionOrderDialog';
import { emptyResumeData } from '../../types/resume';

const baseData = {
  ...emptyResumeData,
  summary: 'A summary',
  experience: [{ company: 'Acme', title: 'Engineer', location: '', start: '2020', end: '2022', description: '' }],
  education: [{ degree: 'BSc', institution: 'State U', location: '', start: '2016', end: '2020', description: '' }],
  skills: ['React'],
};

describe('SectionOrderDialog — single-column templates', () => {
  it('shows one list and no column-move buttons', () => {
    render(
      <SectionOrderDialog
        isOpen
        data={baseData}
        template="modern"
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={vi.fn()}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('Main column')).not.toBeInTheDocument();
    expect(screen.queryByText('Side column')).not.toBeInTheDocument();
    expect(screen.queryByText(/side column/i, { selector: 'button' })).not.toBeInTheDocument();
  });
});

describe('SectionOrderDialog — two-column templates (Sidebar/Split)', () => {
  it.each(['sidebar', 'split'] as const)('%s shows Main column and Side column lists', (template) => {
    render(
      <SectionOrderDialog
        isOpen
        data={baseData}
        template={template}
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={vi.fn()}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Main column')).toBeInTheDocument();
    expect(screen.getByText('Side column')).toBeInTheDocument();
    // The old "sections move within their own column" hint is gone.
    expect(screen.queryByText(/sections move within their own column/i)).not.toBeInTheDocument();
  });

  it('clicking "Move Work Experience to side column →" on Split calls onMoveSectionToColumn with the side column', async () => {
    // Work Experience defaults to the main column, so its row offers a
    // "move to side" button.
    const onMoveSectionToColumn = vi.fn();
    render(
      <SectionOrderDialog
        isOpen
        data={baseData}
        template="split"
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={onMoveSectionToColumn}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Move Work Experience to side column/i }));
    expect(onMoveSectionToColumn).toHaveBeenCalledWith('experience', 'side');
  });

  it('clicking "← Move Skills to main column" on Split calls onMoveSectionToColumn with the main column', async () => {
    const onMoveSectionToColumn = vi.fn();
    render(
      <SectionOrderDialog
        isOpen
        data={baseData}
        template="split"
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={onMoveSectionToColumn}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Move Skills to main column/i }));
    expect(onMoveSectionToColumn).toHaveBeenCalledWith('skills', 'main');
  });

  it('an override that moves Education into the main column renders it there, with its own Move up/down buttons', () => {
    const data = { ...baseData, sectionColumns: { education: 'main' as const } };
    render(
      <SectionOrderDialog
        isOpen
        data={data}
        template="split"
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={vi.fn()}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Move Education up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Move Education to side column/i })).toBeInTheDocument();
  });

  it('"Reset to default layout" button is present', () => {
    render(
      <SectionOrderDialog
        isOpen
        data={baseData}
        template="sidebar"
        onMoveSection={vi.fn()}
        onMoveSectionToColumn={vi.fn()}
        onResetOrder={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reset to default layout' })).toBeInTheDocument();
  });
});
