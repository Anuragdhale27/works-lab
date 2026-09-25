import { useCallback, useEffect, useRef } from 'react';
import { TEMPLATES } from '../../templates';
import { ACCENT_PRESETS } from '../../lib/accentPresets';
import type { TemplateKey, ResumeData } from '../../types/resume';

interface DesignDrawerProps {
  isOpen: boolean;
  template: TemplateKey;
  data: ResumeData;
  onTemplateChange: (template: TemplateKey) => void;
  onAccentChange: (accent: string | undefined) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DesignDrawer({
  isOpen,
  template,
  data,
  onTemplateChange,
  onAccentChange,
  onClose,
  triggerRef,
}: DesignDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    triggerRef?.current?.focus();
  }, [onClose, triggerRef]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the first template option
      const firstTemplate = drawerRef.current?.querySelector('[role="radio"]') as HTMLElement;
      firstTemplate?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="design-drawer-overlay" onClick={handleClose}>
      <div
        className="design-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="design-drawer-header">
          <h2 id="design-drawer-title">Design</h2>
          <button
            className="design-drawer-close"
            onClick={handleClose}
            aria-label="Close design drawer"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="design-drawer-content">
          {/* Template selector */}
          <div className="design-section">
            <h3 className="design-section-title" id="template-group-label">Template</h3>
            <div className="template-cards" role="radiogroup" aria-labelledby="template-group-label">
              {Object.entries(TEMPLATES).map(([key, meta]) => (
                <button
                  key={key}
                  className={`template-card ${template === key ? 'selected' : ''}`}
                  onClick={() => onTemplateChange(key as TemplateKey)}
                  role="radio"
                  aria-checked={template === key}
                >
                  <div className="template-card-name">{meta.name}</div>
                  <div className="template-card-best">{meta.best}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent color selector */}
          <div className="design-section">
            <h3 className="design-section-title" id="accent-group-label">Accent Colour</h3>
            <div className="accent-swatches" role="radiogroup" aria-labelledby="accent-group-label">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = data.accent === preset.color;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    className={`accent-swatch-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => onAccentChange(preset.color)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={preset.name}
                    title={preset.name}
                  >
                    <span
                      className={`accent-swatch ${preset.color ? '' : 'is-default'}`}
                      style={preset.color ? { backgroundColor: preset.color } : undefined}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <svg className="accent-swatch-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="accent-swatch-label">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
