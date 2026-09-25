import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Menu } from '../../components/Menu';
import type { ResumeData } from '../../types/resume';
import { buildDownloadMenuItems } from './downloadMenuItems';
import type { ResumeEditorState } from './useResumeEditor';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface MobilePreviewSheetProps {
  isOpen: boolean;
  templateName: string;
  TemplateComponent: ComponentType<{ data: ResumeData }>;
  data: ResumeData;
  pageCount: number;
  editor: ResumeEditorState;
  showToast: (message: string) => void;
  onClose: () => void;
}

export function MobilePreviewSheet({
  isOpen,
  templateName,
  TemplateComponent,
  data,
  pageCount,
  editor,
  showToast,
  onClose,
}: MobilePreviewSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | 1>('fit');
  const [fitScale, setFitScale] = useState(1);
  const scale = zoomMode === 'fit' ? fitScale : 1;

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
      const closeBtn = sheetRef.current?.querySelector<HTMLElement>('.mobile-preview-close');
      closeBtn?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    function recompute() {
      const w = wrapper!.clientWidth;
      const available = Math.max(0, w - 16);
      setFitScale(Math.min(1, available / A4_WIDTH_PX));
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadMenuItems = buildDownloadMenuItems(editor, showToast);

  return (
    <div className="mobile-preview-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="mobile-preview-title">
      <div className="mobile-preview-header">
        <button className="mobile-preview-close" onClick={handleClose} aria-label="Close preview">
          ✕
        </button>
        <span id="mobile-preview-title" className="mobile-preview-title">
          Preview · {templateName}
        </span>
        <Menu
          trigger={<span className="mobile-preview-download-btn">Download</span>}
          items={downloadMenuItems}
          ariaLabel="Download"
        />
      </div>

      <div className="mobile-preview-toolbar">
        <div className="zoom-controls" role="group" aria-label="Preview zoom level">
          <button type="button" className={zoomMode === 'fit' ? 'active' : ''} aria-pressed={zoomMode === 'fit'} onClick={() => setZoomMode('fit')}>
            Fit
          </button>
          <button type="button" className={zoomMode === 1 ? 'active' : ''} aria-pressed={zoomMode === 1} onClick={() => setZoomMode(1)}>
            100%
          </button>
        </div>
        <span className="page-count-pill">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
      </div>

      <div className="mobile-preview-wrapper" ref={wrapperRef}>
        <div style={{ width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }}>
          <div
            className="a4-page"
            style={{
              width: A4_WIDTH_PX,
              minHeight: A4_HEIGHT_PX,
              transform: `scale(${scale})`,
            }}
          >
            <TemplateComponent data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
