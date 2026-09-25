import { useCallback, useEffect, useRef } from 'react';
import type { ResumeData } from '../../types/resume';
import { buildSteps, stepStatus } from './steps';

interface MobileStepPickerProps {
  isOpen: boolean;
  data: ResumeData;
  currentStepKey: string;
  onSelectStep: (key: string) => void;
  onAddSection: () => void;
  onReorderClick: () => void;
  onClose: () => void;
}

export function MobileStepPicker({
  isOpen,
  data,
  currentStepKey,
  onSelectStep,
  onAddSection,
  onReorderClick,
  onClose,
}: MobileStepPickerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const steps = buildSteps(data);

  useEffect(() => {
    if (isOpen) previousFocusRef.current = document.activeElement as HTMLElement;
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
    previousFocusRef.current?.focus();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      const current = sheetRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
      (current ?? sheetRef.current?.querySelector<HTMLElement>('button'))?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function selectAndClose(key: string) {
    onSelectStep(key);
    onClose();
  }

  return (
    <div className="mobile-sheet-overlay" onClick={handleClose}>
      <div
        className="mobile-step-sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-step-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-sheet-header">
          <h2 id="mobile-step-sheet-title">Jump to a step</h2>
          <button className="mobile-sheet-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mobile-step-sheet-list">
          {steps.map((step, idx) => {
            const status = stepStatus(step, data);
            const isActive = currentStepKey === step.key;
            return (
              <button
                key={step.key}
                type="button"
                className={`mobile-step-sheet-item status-${status}${isActive ? ' active' : ''}`}
                onClick={() => selectAndClose(step.key)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className={`step-nav-dot status-${status}`} aria-hidden="true" />
                <span className="mobile-step-sheet-label">{step.label}</span>
                <span className="mobile-step-sheet-index">{idx + 1}/{steps.length}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="mobile-step-sheet-item mobile-step-sheet-action"
            onClick={() => {
              onAddSection();
              onClose();
            }}
          >
            + Add section
          </button>
          <button
            type="button"
            className="mobile-step-sheet-item mobile-step-sheet-action"
            onClick={() => {
              onReorderClick();
              onClose();
            }}
          >
            Reorder sections
          </button>
        </div>
      </div>
    </div>
  );
}
