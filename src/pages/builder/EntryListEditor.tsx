import React, { useEffect, useRef, useState } from 'react';
import { Menu, type MenuItem } from '../../components/Menu';
import type { FieldConfig } from './sectionConfigs';
import type { EntryTitle } from './entryTitles';

interface EntryListEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  config: FieldConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entryTitle: (item: any, index: number) => EntryTitle;
  addButtonLabel: string;
  idPrefix: string; // e.g., "experience", "projects", "awards"
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onAddBullet?: (index: number, fieldKey: string, textareaElement: HTMLTextAreaElement) => void;
  onBulletKeydown?: (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, fieldKey: string) => void;
  touched?: Set<string>;
  onMarkTouched?: (fieldKey: string) => void;
}

export function EntryListEditor({
  items,
  config,
  entryTitle,
  addButtonLabel,
  idPrefix,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
  onDuplicate,
  onAddBullet,
  onBulletKeydown,
  touched = new Set(),
  onMarkTouched = () => {},
}: EntryListEditorProps) {
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const pendingFocusIndexRef = useRef<number | null>(null);

  // A newly added entry opens expanded with focus in its first field. The
  // new index is the current length at click time (the item lands at the
  // end), so we don't need to wait on the items prop to know it.
  function handleAdd() {
    const newIndex = items.length;
    onAdd();
    setExpandedIndex(newIndex);
    pendingFocusIndexRef.current = newIndex;
  }

  useEffect(() => {
    const idx = pendingFocusIndexRef.current;
    if (idx === null || idx >= items.length) return;
    const card = document.getElementById(`${idPrefix}-card-${idx}`);
    const focusable = card?.querySelector<HTMLElement>('input, textarea, select');
    focusable?.focus();
    pendingFocusIndexRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function handleMove(index: number, direction: 'up' | 'down') {
    onMove(index, direction);
    setExpandedIndex((prev) => {
      if (prev === null) return prev;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (prev === index) return target;
      if (prev === target) return index;
      return prev;
    });
  }

  function handleDuplicate(index: number) {
    onDuplicate(index);
    setExpandedIndex((prev) => (prev !== null && prev > index ? prev + 1 : prev));
  }

  function handleRemove(index: number) {
    onRemove(index);
    setExpandedIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }

  return (
    <>
      {items.map((item, itemIndex) => {
        const { title, meta } = entryTitle(item, itemIndex);
        const isExpanded = expandedIndex === itemIndex;
        const cardId = `${idPrefix}-card-${itemIndex}`;
        const bodyId = `${cardId}-body`;

        const menuItems: MenuItem[] = [
          { label: 'Move up', onClick: () => handleMove(itemIndex, 'up'), disabled: itemIndex === 0 },
          { label: 'Move down', onClick: () => handleMove(itemIndex, 'down'), disabled: itemIndex === items.length - 1 },
          { label: 'Duplicate', onClick: () => handleDuplicate(itemIndex) },
          { isDivider: true },
          {
            label: 'Delete',
            isDanger: true,
            onClick: () => {
              if (window.confirm(`Delete "${title}"?`)) handleRemove(itemIndex);
            },
          },
        ];

        return (
          <div className="entry-card" id={cardId} key={itemIndex}>
            <div className="entry-card-header">
              <button
                type="button"
                className="entry-card-toggle"
                aria-expanded={isExpanded}
                aria-controls={bodyId}
                onClick={() => setExpandedIndex(isExpanded ? null : itemIndex)}
              >
                <svg
                  className={`entry-card-chevron${isExpanded ? ' expanded' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
                <span className="entry-card-title">{title}</span>
                {meta && <span className="entry-card-meta">{meta}</span>}
              </button>
              <Menu trigger={<span aria-hidden="true">⋯</span>} ariaLabel={`${title} options`} items={menuItems} />
            </div>

            {isExpanded && (
              <div className="entry-card-body" id={bodyId}>
                {config.map((field) => {
                  const uniqueFieldKey = `${idPrefix}-${field.key}-${itemIndex}`;
                  let isInvalid = false;

                  // Validation logic specific to field types
                  if (field.key === 'company' && touched.has(uniqueFieldKey)) {
                    isInvalid = item.company?.trim() !== '' && item.title?.trim() === '';
                  }
                  if (field.key === 'title' && touched.has(uniqueFieldKey)) {
                    isInvalid = item.title?.trim() !== '' && item.company?.trim() === '';
                  }

                  if (field.type === 'checkbox') {
                    // "Currently working here" / "Currently studying" checkbox
                    return (
                      <div key={field.key} className="form-group">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={item[field.key] === 'Present'}
                            onChange={(e) => onUpdate(itemIndex, field.key, e.target.checked ? 'Present' : '')}
                            aria-label={field.label}
                          />
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === 'month-or-present') {
                    // Handle "Present" checkbox case — sits beside the date
                    // input, in the same field group, not on its own row.
                    return (
                      <div key={field.key} className="form-group">
                        <label className="form-label" htmlFor={`${uniqueFieldKey}-input`}>{field.label}</label>
                        <div className="date-with-present">
                          <input
                            className="form-input"
                            id={`${uniqueFieldKey}-input`}
                            placeholder={field.placeholder}
                            value={item[field.key]}
                            onChange={(e) => onUpdate(itemIndex, field.key, e.target.value)}
                            disabled={item.end === 'Present' && field.key === 'end'}
                          />
                          {field.key === 'end' && (
                            <label className="form-checkbox form-checkbox-inline">
                              <input
                                type="checkbox"
                                checked={item[field.key] === 'Present'}
                                onChange={(e) => onUpdate(itemIndex, field.key, e.target.checked ? 'Present' : '')}
                                aria-label="Currently working here"
                              />
                              Currently working here
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.key} className={`form-group${field.wide ? ' wide' : ''}`}>
                        <label className="form-label" htmlFor={`${uniqueFieldKey}-select`}>{field.label}</label>
                        <select
                          id={`${uniqueFieldKey}-select`}
                          className="form-select"
                          value={item[field.key] || ''}
                          onChange={(e) => onUpdate(itemIndex, field.key, e.target.value)}
                        >
                          <option value="">Select {field.label.toLowerCase()}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    const textareaId = `${idPrefix}-${itemIndex}-${field.key}`;
                    return (
                      <div key={field.key} className="form-group">
                        <label className="form-label" htmlFor={textareaId}>{field.label}</label>
                        {field.hint && <p className="field-hint">{field.hint}</p>}
                        <div className="textarea-wrapper">
                          {field.bullets && onAddBullet && (
                            <button
                              type="button"
                              className="btn-add-bullet"
                              onClick={() => {
                                const textarea = textareaRefs.current.get(textareaId);
                                if (textarea) {
                                  onAddBullet(itemIndex, field.key, textarea);
                                }
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              aria-label="Add bullet point"
                              title="Add bullet point"
                            >
                              • Add bullet
                            </button>
                          )}
                          <textarea
                            id={textareaId}
                            ref={(el) => {
                              if (el) {
                                textareaRefs.current.set(textareaId, el);
                              } else {
                                textareaRefs.current.delete(textareaId);
                              }
                            }}
                            className="form-textarea"
                            placeholder={field.placeholder}
                            value={item[field.key] || ''}
                            onChange={(e) => onUpdate(itemIndex, field.key, e.target.value)}
                            onKeyDown={(e) => onBulletKeydown?.(e, itemIndex, field.key)}
                          />
                        </div>
                      </div>
                    );
                  }

                  // Default: text input
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const fieldValue = (item as any)[field.key] || '';
                  return (
                    <div key={field.key} className={`form-group`}>
                      <label className="form-label" htmlFor={`${uniqueFieldKey}-input`}>{field.label}</label>
                      <input
                        id={`${uniqueFieldKey}-input`}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={fieldValue as string}
                        onChange={(e) => onUpdate(itemIndex, field.key, e.target.value)}
                        onBlur={() => onMarkTouched(uniqueFieldKey)}
                        aria-invalid={isInvalid || undefined}
                        aria-describedby={isInvalid ? `${uniqueFieldKey}-error` : undefined}
                      />
                      {isInvalid && (
                        <p className="field-error" id={`${uniqueFieldKey}-error`}>
                          {field.key === 'company' && 'Add the company name.'}
                          {field.key === 'title' && 'Add the job title.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn-add-entry" onClick={handleAdd}>
        {addButtonLabel}
      </button>
    </>
  );
}
