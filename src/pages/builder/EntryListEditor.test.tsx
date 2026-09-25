import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { EntryListEditor } from './EntryListEditor';
import type { FieldConfig } from './sectionConfigs';

describe('EntryListEditor', () => {
  const mockConfig: FieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Test' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Desc', bullets: true },
  ];

  const mockItems = [
    { name: 'Item 1', description: 'Desc 1' },
    { name: 'Item 2', description: 'Desc 2' },
  ];

  const entryTitle = (item: { name: string }, i: number) => ({ title: item.name || `Untitled item ${i + 1}` });

  function baseProps(overrides: Partial<Parameters<typeof EntryListEditor>[0]> = {}) {
    return {
      items: mockItems,
      config: mockConfig,
      entryTitle,
      addButtonLabel: '+ Add',
      idPrefix: 'test',
      onAdd: vi.fn(),
      onUpdate: vi.fn(),
      onRemove: vi.fn(),
      onMove: vi.fn(),
      onDuplicate: vi.fn(),
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a collapsed card per item showing its computed title', () => {
    render(<EntryListEditor {...baseProps()} />);

    expect(screen.getByRole('button', { name: 'Item 1' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Item 2' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByDisplayValue('Item 1')).not.toBeInTheDocument();
  });

  it('expands a card on click and shows its fields; only one expanded at a time', () => {
    render(<EntryListEditor {...baseProps()} />);

    const firstToggle = screen.getByRole('button', { name: 'Item 1' });
    fireEvent.click(firstToggle);
    expect(firstToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();

    const secondToggle = screen.getByRole('button', { name: 'Item 2' });
    fireEvent.click(secondToggle);
    expect(secondToggle).toHaveAttribute('aria-expanded', 'true');
    expect(firstToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByDisplayValue('Item 1')).not.toBeInTheDocument();

    // Clicking the expanded card again collapses it.
    fireEvent.click(secondToggle);
    expect(secondToggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('a newly added entry opens expanded with focus in its first field', () => {
    const onAdd = vi.fn();
    const { rerender } = render(<EntryListEditor {...baseProps({ onAdd })} />);

    fireEvent.click(screen.getByText('+ Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);

    // Simulate the parent appending the new item (as the real onAdd would).
    const withNewItem = [...mockItems, { name: '', description: '' }];
    rerender(<EntryListEditor {...baseProps({ onAdd, items: withNewItem })} />);

    const newToggle = screen.getAllByRole('button', { name: /Untitled item 3/ })[0];
    expect(newToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByPlaceholderText('Test')).toHaveFocus();
  });

  it('the card menu calls move/duplicate/delete with the right index', () => {
    const onMove = vi.fn();
    const onDuplicate = vi.fn();
    const onRemove = vi.fn();
    render(<EntryListEditor {...baseProps({ onMove, onDuplicate, onRemove })} />);

    const firstCard = screen.getByText('Item 1').closest('.entry-card') as HTMLElement;
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Item 1 options' }));

    // "Move up" is disabled on the first card.
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toBeDisabled();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Move down' }));
    expect(onMove).toHaveBeenCalledWith(0, 'down');

    fireEvent.click(within(firstCard).getByRole('button', { name: 'Item 1 options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onDuplicate).toHaveBeenCalledWith(0);

    fireEvent.click(within(firstCard).getByRole('button', { name: 'Item 1 options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(window.confirm).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('disables "Move down" on the last card', () => {
    render(<EntryListEditor {...baseProps()} />);
    const secondCard = screen.getByText('Item 2').closest('.entry-card') as HTMLElement;
    fireEvent.click(within(secondCard).getByRole('button', { name: 'Item 2 options' }));
    expect(screen.getByRole('menuitem', { name: 'Move down' })).toBeDisabled();
  });

  it('delete is cancelled when the confirm dialog is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onRemove = vi.fn();
    render(<EntryListEditor {...baseProps({ onRemove })} />);
    const firstCard = screen.getByText('Item 1').closest('.entry-card') as HTMLElement;
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Item 1 options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('bullet button inserts bullet into correct textarea', () => {
    const onAddBullet = vi.fn((_index, _fieldKey, textarea) => {
      expect(textarea.id).toContain('description');
      expect(textarea.value).toBe('Desc 1');
    });

    render(<EntryListEditor {...baseProps({ onAddBullet })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item 1' }));

    const bulletButton = screen.getByTitle('Add bullet point');
    fireEvent.click(bulletButton);
    expect(onAddBullet).toHaveBeenCalled();
  });

  it('generates unique ids across multiple editors', () => {
    const { container } = render(
      <>
        <EntryListEditor {...baseProps({ idPrefix: 'experience' })} />
        <EntryListEditor {...baseProps({ idPrefix: 'projects' })} />
      </>,
    );

    const allIds = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    expect(allIds.filter((id) => id.includes('experience')).length).toBeGreaterThan(0);
    expect(allIds.filter((id) => id.includes('projects')).length).toBeGreaterThan(0);
  });
});
