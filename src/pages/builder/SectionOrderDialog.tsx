import { useCallback, useEffect, useRef } from 'react';
import type { ResumeData, TemplateKey } from '../../types/resume';
import type { Column } from '../../lib/sectionColumns';
import { SectionOrderPanel } from './SectionOrderPanel';

interface SectionOrderDialogProps {
  isOpen: boolean;
  data: ResumeData;
  template: TemplateKey;
  onMoveSection: (sectionKey: string, direction: 'up' | 'down') => void;
  onMoveSectionToColumn: (sectionKey: string, column: Column) => void;
  onResetOrder: () => void;
  onClose: () => void;
}

export function SectionOrderDialog({
  isOpen,
  data,
  template,
  onMoveSection,
  onMoveSectionToColumn,
  onResetOrder,
  onClose,
}: SectionOrderDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
      const closeBtn = dialogRef.current?.querySelector<HTMLElement>('.section-order-dialog-close');
      closeBtn?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="section-order-overlay" onClick={handleClose}>
      <div
        className="section-order-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-order-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-order-dialog-header">
          <h2 id="section-order-dialog-title">Reorder sections</h2>
          <button className="section-order-dialog-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        <SectionOrderPanel
          data={data}
          template={template}
          onMoveSection={onMoveSection}
          onMoveSectionToColumn={onMoveSectionToColumn}
          onResetOrder={onResetOrder}
        />
      </div>
    </div>
  );
}
