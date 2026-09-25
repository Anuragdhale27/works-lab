import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignDrawer } from './DesignDrawer';
import { emptyResumeData } from '../../types/resume';

describe('DesignDrawer', () => {
  it('renders nothing when closed', () => {
    render(
      <DesignDrawer
        isOpen={false}
        template="modern"
        data={emptyResumeData}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('selecting a template card calls onTemplateChange with that key', () => {
    const onTemplateChange = vi.fn();
    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={emptyResumeData}
        onTemplateChange={onTemplateChange}
        onAccentChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Classic ATS/ }));
    expect(onTemplateChange).toHaveBeenCalledWith('classic');
  });

  it('selecting an accent swatch calls onAccentChange with that colour', () => {
    const onAccentChange = vi.fn();
    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={emptyResumeData}
        onTemplateChange={vi.fn()}
        onAccentChange={onAccentChange}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Maroon' }));
    expect(onAccentChange).toHaveBeenCalledWith('#7c2d12');
  });

  it('marks the currently selected template and accent', () => {
    render(
      <DesignDrawer
        isOpen
        template="classic"
        data={{ ...emptyResumeData, accent: '#7c2d12' }}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /Classic ATS/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Modern ATS/ })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Maroon' })).toHaveAttribute('aria-checked', 'true');
  });

  it('Escape closes the drawer and returns focus to the trigger', () => {
    const onClose = vi.fn();
    const triggerButton = document.createElement('button');
    document.body.appendChild(triggerButton);
    const triggerRef = { current: triggerButton };

    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={emptyResumeData}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={onClose}
        triggerRef={triggerRef}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(triggerButton).toHaveFocus();

    document.body.removeChild(triggerButton);
  });

  it('the close button calls onClose', () => {
    const onClose = vi.fn();
    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={emptyResumeData}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close design drawer' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
