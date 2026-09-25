import React, { useRef } from 'react';
import type { FieldConfig } from './sectionConfigs';

interface EntryListEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  config: FieldConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemTitleFn: (item: any, index: number) => string;
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
  itemTitleFn,
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

  return (
    <>
      {items.map((item, itemIndex) => (
        <div className="entry-card" key={itemIndex}>
          <div className="entry-card-header">
            <div className="entry-card-title">{itemTitleFn(item, itemIndex)}</div>
            <div className="entry-card-actions">
              {itemIndex > 0 && (
                <button
                  className="btn-move"
                  onClick={() => onMove(itemIndex, 'up')}
                  aria-label="Move up"
                  title="Move up"
                >
                  ↑
                </button>
              )}
              {itemIndex < items.length - 1 && (
                <button
                  className="btn-move"
                  onClick={() => onMove(itemIndex, 'down')}
                  aria-label="Move down"
                  title="Move down"
                >
                  ↓
                </button>
              )}
              <button className="btn-move" onClick={() => onDuplicate(itemIndex)} title="Duplicate">⧉</button>
              <button className="btn-remove" onClick={() => onRemove(itemIndex)}>Remove</button>
            </div>
          </div>

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
              // Handle "Present" checkbox case
              return (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    className="form-input"
                    id={`${uniqueFieldKey}-input`}
                    placeholder={field.placeholder}
                    value={item[field.key]}
                    onChange={(e) => onUpdate(itemIndex, field.key, e.target.value)}
                    disabled={item.end === 'Present' && field.key === 'end'}
                  />
                  {field.key === 'end' && (
                    <label className="form-checkbox">
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
      ))}

      <button className="btn-add-entry" onClick={onAdd}>
        {addButtonLabel}
      </button>
    </>
  );
}
