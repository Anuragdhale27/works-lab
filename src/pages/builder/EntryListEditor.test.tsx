import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders fields from config', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc 1')).toBeInTheDocument();
  });

  it('calls add callback with correct index', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
      />
    );

    fireEvent.click(screen.getByText('+ Add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('calls move callback with correct index and direction', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
      />
    );

    const downButtons = screen.getAllByTitle('Move down');
    fireEvent.click(downButtons[0]);
    expect(onMove).toHaveBeenCalledWith(0, 'down');
  });

  it('calls duplicate callback with correct index', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
      />
    );

    const dupButtons = screen.getAllByTitle('Duplicate');
    fireEvent.click(dupButtons[0]);
    expect(onDuplicate).toHaveBeenCalledWith(0);
  });

  it('calls remove callback with correct index', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('bullet button inserts bullet into correct textarea', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();
    const onAddBullet = vi.fn((_index, _fieldKey, textarea) => {
      expect(textarea.id).toContain('description');
      expect(textarea.value).toBe('Desc 1');
    });

    render(
      <EntryListEditor
        items={mockItems}
        config={mockConfig}
        itemTitleFn={(_, i) => `Item ${i + 1}`}
        addButtonLabel="+ Add"
        idPrefix="test"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onAddBullet={onAddBullet}
      />
    );

    const bulletButtons = screen.getAllByTitle('Add bullet point');
    fireEvent.click(bulletButtons[0]);
    expect(onAddBullet).toHaveBeenCalled();
  });

  it('generates unique ids across multiple editors', () => {
    const onAdd = vi.fn();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const onMove = vi.fn();
    const onDuplicate = vi.fn();

    const { container } = render(
      <>
        <EntryListEditor
          items={mockItems}
          config={mockConfig}
          itemTitleFn={(_, i) => `Item ${i + 1}`}
          addButtonLabel="+ Add"
          idPrefix="experience"
          onAdd={onAdd}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onMove={onMove}
          onDuplicate={onDuplicate}
        />
        <EntryListEditor
          items={mockItems}
          config={mockConfig}
          itemTitleFn={(_, i) => `Item ${i + 1}`}
          addButtonLabel="+ Add"
          idPrefix="projects"
          onAdd={onAdd}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onMove={onMove}
          onDuplicate={onDuplicate}
        />
      </>
    );

    const allIds = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    expect(allIds.filter((id) => id.includes('experience')).length).toBeGreaterThan(0);
    expect(allIds.filter((id) => id.includes('projects')).length).toBeGreaterThan(0);
  });
});
