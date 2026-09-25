import { useCallback, useEffect, useRef } from 'react';
import { TEMPLATES } from '../../templates';
import type { TemplateKey, ResumeData } from '../../types/resume';

const ACCENT_PRESETS = [
  { name: 'Emerald', value: '#0E7A5A' },
  { name: 'Blue', value: '#1e3a5f' },
  { name: 'Maroon', value: '#7c2d12' },
  { name: 'Navy', value: '#001f3f' },
  { name: 'Purple', value: '#553399' },
  { name: 'Slate', value: '#3f3f46' },
];

interface DesignDrawerProps {
  isOpen: boolean;
  template: TemplateKey;
  data: ResumeData;
  onTemplateChange: (template: TemplateKey) => void;
  onAccentChange: (accent: string) => void;
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
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  className={`accent-swatch ${data.accent === preset.value ? 'selected' : ''}`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => onAccentChange(preset.value)}
                  role="radio"
                  aria-checked={data.accent === preset.value}
                  aria-label={preset.name}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
