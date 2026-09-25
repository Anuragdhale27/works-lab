import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignDrawer } from './DesignDrawer';
import { emptyResumeData } from '../../types/resume';
import { ACCENT_PRESETS } from '../../lib/accentPresets';

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
    expect(onAccentChange).toHaveBeenCalledWith('#7f1d1d');
  });

  it('marks the currently selected template and accent', () => {
    render(
      <DesignDrawer
        isOpen
        template="classic"
        data={{ ...emptyResumeData, accent: '#7f1d1d' }}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /Classic ATS/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Modern ATS/ })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Maroon' })).toHaveAttribute('aria-checked', 'true');
  });

  it('selecting Default calls onAccentChange with undefined', () => {
    const onAccentChange = vi.fn();
    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={{ ...emptyResumeData, accent: '#7f1d1d' }}
        onTemplateChange={vi.fn()}
        onAccentChange={onAccentChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Default' }));
    expect(onAccentChange).toHaveBeenCalledWith(undefined);
  });

  it('offers exactly the 8 original accent presets', () => {
    expect(ACCENT_PRESETS).toEqual([
      { name: 'Default', color: undefined },
      { name: 'Navy', color: '#1e3a5f' },
      { name: 'Teal', color: '#0f766e' },
      { name: 'Emerald', color: '#0E7A5A' },
      { name: 'Maroon', color: '#7f1d1d' },
      { name: 'Plum', color: '#5b21b6' },
      { name: 'Slate', color: '#334155' },
      { name: 'Charcoal', color: '#1f2937' },
    ]);

    render(
      <DesignDrawer
        isOpen
        template="modern"
        data={emptyResumeData}
        onTemplateChange={vi.fn()}
        onAccentChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Accent Colour' });
    expect(group.querySelectorAll('[role="radio"]')).toHaveLength(8);
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
