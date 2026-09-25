import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import type { TemplateKey } from '../types/resume';
import { TEMPLATES, isTemplateKey } from '../templates';
import { resolveSectionOrder, moveSection as moveSectionOrder } from '../lib/sectionOrder';
import { downloadPDF } from '../lib/downloadPdf';
import { SkipLink } from '../components/SkipLink';
import { useToast } from '../components/ToastProvider';
import { useResumeEditor } from './builder/useResumeEditor';
import { BuilderTopBar } from './builder/BuilderTopBar';
import { StepNav } from './builder/StepNav';
import { DesignDrawer } from './builder/DesignDrawer';
import { SectionOrderDialog } from './builder/SectionOrderDialog';
import { MobileStepPicker } from './builder/MobileStepPicker';
import { MobileBottomBar } from './builder/MobileBottomBar';
import { MobilePreviewSheet } from './builder/MobilePreviewSheet';
import { StepFooter } from './builder/StepFooter';
import { FormStepContent } from './builder/FormStepContent';
import { buildSteps } from './builder/steps';
import './builder/builder.css';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const ZOOM_STEPS = [0.5, 0.75, 1] as const;
type ZoomMode = 'fit' | (typeof ZOOM_STEPS)[number];
const CURRENT_STEP_KEY = 'workslab_current_step';

export function Builder() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const editor = useResumeEditor();

  const [template, setTemplate] = useState<TemplateKey>(() => {
    const t = searchParams.get('template');
    return isTemplateKey(t ?? undefined) ? (t as TemplateKey) : 'modern';
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const designButtonRef = useRef<HTMLButtonElement>(null);
  const stepPickerButtonRef = useRef<HTMLButtonElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isStepPickerOpen, setIsStepPickerOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [fitScale, setFitScale] = useState(1);
  const scale = zoomMode === 'fit' ? fitScale : zoomMode;
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);
  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT_PX));

  const steps = buildSteps(editor.data);
  const [currentStepKey, setCurrentStepKeyState] = useState<string>(() => {
    try {
      return sessionStorage.getItem(CURRENT_STEP_KEY) || steps[0].key;
    } catch {
      return steps[0].key;
    }
  });

  function goToStep(key: string) {
    setCurrentStepKeyState(key);
    try {
      sessionStorage.setItem(CURRENT_STEP_KEY, key);
    } catch {
      // Ignore storage errors (private browsing, quota, etc).
    }
  }

  // If the current step disappears (its custom section was deleted, or
  // stale sessionStorage points at a step that no longer exists), fall
  // back to the first step instead of showing a blank panel.
  useEffect(() => {
    if (!steps.some((s) => s.key === currentStepKey)) {
      goToStep(steps[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.map((s) => s.key).join('|')]);

  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === currentStepKey));
  const currentStep = steps[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;
  const nextStep = steps[currentIndex + 1];
  const nextLabel = isLastStep ? 'Finish · Download PDF' : `Next: ${nextStep.label}`;

  // Scroll the form panel to top and move focus to the step heading on
  // every step change, so screen-reader users hear the new step.
  useEffect(() => {
    formPanelRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [currentStepKey]);

  // Fit scale computation
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    function recompute() {
      const w = wrapper!.clientWidth;
      const padding = 16;
      const available = Math.max(0, w - padding);
      setFitScale(Math.min(1, available / A4_WIDTH_PX));
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Content height measurement. This drives the page-count pill and the
  // page-break lines on both the desktop preview panel and the mobile
  // preview sheet, so it's measured from `measureRef` — an always-mounted,
  // off-screen (not display:none) copy of the template — rather than the
  // on-screen `.a4-page` node, which is display:none on mobile and would
  // measure 0 there.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    function recompute() {
      setContentHeight(el!.scrollHeight || A4_HEIGHT_PX);
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editor.data, template]);

  // Restore textarea caret position
  useEffect(() => {
    if (editor.pendingCaretRef.current) {
      const { textareaId, position } = editor.pendingCaretRef.current;
      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = position;
        textarea.focus();
      }
      editor.pendingCaretRef.current = null;
    }
  }, [editor.data, editor.pendingCaretRef]);

  function handleAddBullet(sectionKey: 'experience' | 'education' | 'projects', entryIndex: number, textarea: HTMLTextAreaElement) {
    const start = textarea.selectionStart;
    const text = textarea.value;
    const beforeCursor = text.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const isAtLineStart = lastNewline === -1 || beforeCursor.substring(lastNewline + 1).trim() === '';

    if (isAtLineStart && lastNewline !== -1) {
      const lineStart = lastNewline + 1;
      const newValue = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: lineStart + 2 };
      editor.updateEntry(sectionKey, entryIndex, 'description', newValue);
    } else {
      const newValue = text + (text && !text.endsWith('\n') ? '\n' : '') + '• ';
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: newValue.length };
      editor.updateEntry(sectionKey, entryIndex, 'description', newValue);
    }
  }

  function handleBulletKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>, sectionKey: 'experience' | 'education' | 'projects', entryIndex: number) {
    if (e.key !== 'Enter') return;
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const text = textarea.value;
    const beforeCursor = text.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = text.substring(lineStart, start);
    const isLineStartWithBullet = /^[•\-*–]\s/.test(currentLine.trim());
    const isOnlyBullet = /^[•\-*–]\s*$/.test(currentLine);

    if (isOnlyBullet) {
      e.preventDefault();
      const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: lineStart + 1 };
      editor.updateEntry(sectionKey, entryIndex, 'description', newText);
    } else if (isLineStartWithBullet) {
      e.preventDefault();
      const afterCursor = text.substring(start);
      const newText = text.substring(0, start) + '\n• ' + afterCursor;
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: start + 3 };
      editor.updateEntry(sectionKey, entryIndex, 'description', newText);
    }
  }

  function handleAddBulletCustom(customId: string, itemIndex: number, textarea: HTMLTextAreaElement) {
    const start = textarea.selectionStart;
    const text = textarea.value;
    const beforeCursor = text.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const isAtLineStart = lastNewline === -1 || beforeCursor.substring(lastNewline + 1).trim() === '';

    if (isAtLineStart && lastNewline !== -1) {
      const lineStart = lastNewline + 1;
      const newValue = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: lineStart + 2 };
      editor.updateCustomItem(customId, itemIndex, 'description', newValue);
    } else {
      const newValue = text + (text && !text.endsWith('\n') ? '\n' : '') + '• ';
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: newValue.length };
      editor.updateCustomItem(customId, itemIndex, 'description', newValue);
    }
  }

  function handleBulletKeydownCustom(e: React.KeyboardEvent<HTMLTextAreaElement>, customId: string, itemIndex: number) {
    if (e.key !== 'Enter') return;
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const text = textarea.value;
    const beforeCursor = text.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = text.substring(lineStart, start);
    const isLineStartWithBullet = /^[•\-*–]\s/.test(currentLine.trim());
    const isOnlyBullet = /^[•\-*–]\s*$/.test(currentLine);

    if (isOnlyBullet) {
      e.preventDefault();
      const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: lineStart + 1 };
      editor.updateCustomItem(customId, itemIndex, 'description', newText);
    } else if (isLineStartWithBullet) {
      e.preventDefault();
      const afterCursor = text.substring(start);
      const newText = text.substring(0, start) + '\n• ' + afterCursor;
      editor.pendingCaretRef.current = { textareaId: textarea.id, position: start + 3 };
      editor.updateCustomItem(customId, itemIndex, 'description', newText);
    }
  }

  function handleMoveSection(sectionKey: string, direction: 'up' | 'down') {
    const resolved = resolveSectionOrder(editor.data);
    const newOrder = moveSectionOrder(resolved, sectionKey, direction === 'up' ? -1 : 1);
    editor.setData({ ...editor.data, sectionOrder: newOrder }, true);
  }

  function handleResetSectionOrder() {
    editor.setData({ ...editor.data, sectionOrder: [] }, true);
  }

  function handleAddSection() {
    const id = editor.addCustomSection();
    goToStep(`custom:${id}`);
  }

  function handleNext() {
    if (isLastStep) {
      downloadPDF(showToast);
      return;
    }
    goToStep(nextStep.key);
  }

  function handleBack() {
    if (isFirstStep) return;
    goToStep(steps[currentIndex - 1].key);
  }

  const TemplateComponent = TEMPLATES[template].Component;

  return (
    <>
      <SkipLink />
      <div className="builder-shell">
        <BuilderTopBar
          editor={editor}
          isDesignOpen={isDesignOpen}
          onDesignClick={() => setIsDesignOpen((v) => !v)}
          onLoadExample={() => editor.loadExample(showToast)}
          onImportClick={() => importInputRef.current?.click()}
          onClearEverything={() => editor.clearEverything(showToast)}
          showToast={showToast}
          designButtonRef={designButtonRef}
        />

        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Import resume JSON file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) editor.importData(file, showToast);
            e.target.value = '';
          }}
        />

        <StepNav
          data={editor.data}
          currentStepKey={currentStepKey}
          onSelectStep={goToStep}
          onAddSection={handleAddSection}
          onReorderClick={() => setIsReorderOpen(true)}
        />

        {/* Mobile step picker trigger — replaces the old Edit/Preview toggle
            and chip section nav. */}
        <button
          type="button"
          ref={stepPickerButtonRef}
          className="mobile-step-trigger"
          aria-haspopup="dialog"
          aria-expanded={isStepPickerOpen}
          onClick={() => setIsStepPickerOpen(true)}
        >
          <span>{currentStep.label} · {currentIndex + 1}/{steps.length}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <main id="main" tabIndex={-1} className="builder-main">
          <div className="builder-panels">
            {/* FORM PANEL */}
            <div className="builder-form-panel" ref={formPanelRef}>
              <div className="builder-form-header">
                <p className="step-progress-label">Step {currentIndex + 1} of {steps.length}</p>
                <h2 ref={headingRef} tabIndex={-1}>
                  {currentStep.label}
                  {currentStep.optional && <span className="step-optional-tag">optional</span>}
                </h2>
                {currentStep.hint && <p className="step-hint">{currentStep.hint}</p>}
              </div>

              <div className="builder-sections">
                <FormStepContent
                  editor={editor}
                  currentStepKey={currentStepKey}
                  showToast={showToast}
                  onAddBullet={handleAddBullet}
                  onBulletKeydown={handleBulletKeydown}
                  onAddBulletCustom={handleAddBulletCustom}
                  onBulletKeydownCustom={handleBulletKeydownCustom}
                />
              </div>

              <StepFooter canGoBack={!isFirstStep} nextLabel={nextLabel} onBack={handleBack} onNext={handleNext} />
            </div>

            {/* PREVIEW PANEL (desktop) */}
            <div className="builder-preview-panel">
              <div className="preview-header">
                <span className="preview-title">Preview · {TEMPLATES[template].name}</span>
                <div className="preview-header-controls">
                  <div className="zoom-controls" role="group" aria-label="Preview zoom level">
                    <button
                      type="button"
                      className={zoomMode === 'fit' ? 'active' : ''}
                      aria-pressed={zoomMode === 'fit'}
                      onClick={() => setZoomMode('fit')}
                    >
                      Fit
                    </button>
                    {ZOOM_STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        className={zoomMode === step ? 'active' : ''}
                        aria-pressed={zoomMode === step}
                        onClick={() => setZoomMode(step)}
                      >
                        {Math.round(step * 100)}%
                      </button>
                    ))}
                  </div>
                  <span
                    className="page-count-pill"
                    title={
                      pageCount > 1
                        ? `${pageCount} pages — recruiters prefer 1 page for under 10 years of experience.`
                        : 'Fits on 1 page.'
                    }
                  >
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </div>
              </div>

              <div className="preview-wrapper" ref={wrapperRef}>
                <div
                  style={{
                    width: A4_WIDTH_PX * scale,
                    height: Math.max(contentHeight, A4_HEIGHT_PX) * scale,
                  }}
                >
                  <div
                    className="a4-page"
                    style={{
                      width: A4_WIDTH_PX,
                      minHeight: A4_HEIGHT_PX,
                      transform: `scale(${scale})`,
                    }}
                  >
                    <div ref={previewRef}>
                      <TemplateComponent data={editor.data} />
                    </div>

                    {pageCount > 1 && (
                      <div
                        className="page-break-overlay"
                        aria-hidden="true"
                        style={{ width: A4_WIDTH_PX, height: pageCount * A4_HEIGHT_PX }}
                      >
                        {Array.from({ length: pageCount - 1 }, (_, i) => (
                          <div
                            key={i}
                            className="page-break-line"
                            style={{ top: (i + 1) * A4_HEIGHT_PX }}
                          >
                            <span className="page-break-label">Page {i + 2}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <MobileBottomBar
          canGoBack={!isFirstStep}
          nextLabel={nextLabel}
          onBack={handleBack}
          onNext={handleNext}
          onPreview={() => setIsMobilePreviewOpen(true)}
        />

        <DesignDrawer
          isOpen={isDesignOpen}
          template={template}
          data={editor.data}
          onTemplateChange={setTemplate}
          onAccentChange={(accent) => editor.setData({ ...editor.data, accent }, true)}
          onClose={() => setIsDesignOpen(false)}
          triggerRef={designButtonRef}
        />

        <SectionOrderDialog
          isOpen={isReorderOpen}
          data={editor.data}
          template={template}
          onMoveSection={handleMoveSection}
          onResetOrder={handleResetSectionOrder}
          onClose={() => setIsReorderOpen(false)}
        />

        <MobileStepPicker
          isOpen={isStepPickerOpen}
          data={editor.data}
          currentStepKey={currentStepKey}
          onSelectStep={goToStep}
          onAddSection={handleAddSection}
          onReorderClick={() => setIsReorderOpen(true)}
          onClose={() => setIsStepPickerOpen(false)}
        />
      </div>

      <MobilePreviewSheet
        isOpen={isMobilePreviewOpen}
        templateName={TEMPLATES[template].name}
        TemplateComponent={TemplateComponent}
        data={editor.data}
        pageCount={pageCount}
        contentHeight={contentHeight}
        editor={editor}
        showToast={showToast}
        onClose={() => setIsMobilePreviewOpen(false)}
      />

      {/* Off-screen, always-mounted copy of the template used only to
          measure its unscaled content height (see the effect above).
          Positioned off-canvas rather than display:none, which would
          report a 0 scrollHeight and break the page count whenever the
          visible preview isn't rendered (e.g. on mobile). */}
      <div className="preview-measure" aria-hidden="true">
        <div style={{ width: A4_WIDTH_PX }} ref={measureRef}>
          <TemplateComponent data={editor.data} />
        </div>
      </div>

      {document.getElementById('print-root') &&
        createPortal(
          <div className="print-resume-page">
            <TemplateComponent data={editor.data} />
          </div>,
          document.getElementById('print-root')!,
        )}
    </>
  );
}
