import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  ProjectEntry,
  ResumeData,
} from '../types/resume';
import { emptyResumeData, type TemplateKey } from '../types/resume';
import { TEMPLATES, isTemplateKey } from '../templates';
import { loadResumeData, saveResumeData, validateResumeData } from '../lib/storage';
import { SkipLink } from '../components/SkipLink';
import { useToast } from '../components/ToastProvider';
import { SectionNav } from '../components/SectionNav';
import { sampleResumeData } from '../lib/sampleData';
import { computeOverallProgress, isResumeDataEmpty } from '../lib/completeness';

const LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A4 at 96dpi — matches the @page A4 size the print export uses.
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const ZOOM_STEPS = [0.5, 0.75, 1] as const;
type ZoomMode = 'fit' | (typeof ZOOM_STEPS)[number];

export function Builder() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [data, setData] = useState<ResumeData>(emptyResumeData);
  const [template, setTemplate] = useState<TemplateKey>(() => {
    const t = searchParams.get('template');
    return isTemplateKey(t ?? undefined) ? (t as TemplateKey) : 'modern';
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Track pending caret position for textarea focus restoration after state updates
  const pendingCaretRef = useRef<{ textareaId: string; position: number } | null>(null);

  // Mobile-only Edit/Preview toggle. Ignored above the 900px breakpoint,
  // where both panels are always shown side by side.
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  // Fields the user has blurred at least once — inline validation only kicks
  // in after that, never while the user is still typing.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  function markTouched(field: string) {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }

  // Zoom / fit state.
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [fitScale, setFitScale] = useState(1);
  const scale = zoomMode === 'fit' ? fitScale : zoomMode;

  // Measured content height (unscaled px) used to compute page count and
  // page-break offsets.
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);
  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT_PX));

  // Save-state indicator.
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const isFirstDataEffect = useRef(true);

  // Load persisted data on mount only.
  useEffect(() => {
    setData(loadResumeData());
  }, []);

  // Debounced persist on every change, with an honest saving/saved/error state.
  useEffect(() => {
    if (isFirstDataEffect.current) {
      // Don't show "saving" for the initial load-triggered render.
      isFirstDataEffect.current = false;
      return;
    }
    setSaveState('saving');
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      const ok = saveResumeData(data);
      if (ok) {
        setSaveState('saved');
        setSavedAt(new Date());
      } else {
        setSaveState('error');
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [data]);

  // Keep the "fit" scale in sync with the panel's actual measured width.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    function recompute() {
      const w = wrapper!.clientWidth;
      const padding = 16; // 8px each side, see .preview-wrapper
      const available = Math.max(0, w - padding);
      setFitScale(Math.min(1, available / A4_WIDTH_PX));
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Re-measure when the mobile Edit/Preview toggle reveals the preview
  // panel — it goes from display:none (0 width) to its real width, and
  // that transition isn't always caught by the ResizeObserver callback
  // above before paint.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    const padding = 16;
    const available = Math.max(0, w - padding);
    setFitScale(Math.min(1, available / A4_WIDTH_PX));
  }, [mobileView]);

  // Track the resume's actual rendered height so we know the page count and
  // where each page-break falls.
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    function recompute() {
      setContentHeight(el!.scrollHeight || A4_HEIGHT_PX);
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, template]);

  // Restore textarea caret position after state updates from bullet operations
  useEffect(() => {
    if (pendingCaretRef.current) {
      const { textareaId, position } = pendingCaretRef.current;
      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = position;
        textarea.focus();
      }
      pendingCaretRef.current = null;
    }
  }, [data]);

  function updatePersonal(field: keyof ResumeData['personal'], value: string) {
    setData((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));
  }

  const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

  // Validates, then downscales to a 240px-max JPEG so the data URL stays small enough for localStorage.
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return showToast('Please choose a JPG, PNG or WebP image.');
    if (file.size > MAX_PHOTO_BYTES) return showToast('Photo must be under 5 MB.');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const size = Math.min(240, side);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      // Centre-crop to a square.
      canvas.getContext('2d')?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      updatePersonal('photo', canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Could not read that image.');
    };
    img.src = url;
  }

  function updateSummary(value: string) {
    setData((d) => ({ ...d, summary: value }));
  }

  // Generic helpers for repeatable array sections.
  function addEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages'>(
    key: K,
    entry: ResumeData[K][number],
  ) {
    setData((d) => ({ ...d, [key]: [...d[key], entry] } as ResumeData));
  }

  function updateEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages'>(
    key: K,
    index: number,
    field: string,
    value: string,
  ) {
    setData((d) => {
      const list = [...(d[key] as unknown as Array<Record<string, string>>)];
      list[index] = { ...list[index], [field]: value };
      return { ...d, [key]: list } as ResumeData;
    });
  }

  function removeEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages'>(
    key: K,
    index: number,
  ) {
    setData((d) => {
      const list = [...(d[key] as unknown[])];
      list.splice(index, 1);
      return { ...d, [key]: list } as ResumeData;
    });
  }

  function moveEntry<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages'>(
    key: K,
    index: number,
    direction: 'up' | 'down',
  ) {
    setData((d) => {
      const list = [...(d[key] as unknown[])];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return d;
      [list[index], list[newIndex]] = [list[newIndex], list[index]];
      return { ...d, [key]: list } as ResumeData;
    });
  }

  function handleAddBullet(
    sectionKey: 'experience' | 'education' | 'projects',
    entryIndex: number,
    textareaId: string,
  ) {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const text = textarea.value;
    const beforeCursor = text.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const isAtLineStart = lastNewline === -1 || beforeCursor.substring(lastNewline + 1).trim() === '';

    if (isAtLineStart && lastNewline !== -1) {
      // Insert bullet at start of current line (before cursor)
      const lineStart = lastNewline + 1;
      const newValue = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
      // Store pending caret position for restoration after state update
      pendingCaretRef.current = { textareaId, position: lineStart + 2 };
      updateEntry(sectionKey, entryIndex, 'description', newValue);
    } else {
      // Append bullet on new line
      const newValue = text + (text && !text.endsWith('\n') ? '\n' : '') + '• ';
      // Store pending caret position for restoration after state update
      pendingCaretRef.current = { textareaId, position: newValue.length };
      updateEntry(sectionKey, entryIndex, 'description', newValue);
    }
  }

  function handleBulletKeydown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    sectionKey: 'experience' | 'education' | 'projects',
    entryIndex: number,
  ) {
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
      // Remove the bullet marker and continue on new line
      e.preventDefault();
      const newText = text.substring(0, lineStart) + '\n' + text.substring(start);
      const textareaId = textarea.id;
      pendingCaretRef.current = { textareaId, position: lineStart + 1 };
      updateEntry(sectionKey, entryIndex, 'description', newText);
    } else if (isLineStartWithBullet) {
      // Continue with a new bullet on next line
      e.preventDefault();
      const afterCursor = text.substring(start);
      const newText = text.substring(0, start) + '\n• ' + afterCursor;
      const textareaId = textarea.id;
      pendingCaretRef.current = { textareaId, position: start + 3 };
      updateEntry(sectionKey, entryIndex, 'description', newText);
    }
  }

  function loadExample() {
    if (!isResumeDataEmpty(data)) {
      const ok = window.confirm('This will replace your current entries with the example resume. Continue?');
      if (!ok) return;
    }
    setData(sampleResumeData);
    showToast('Example resume loaded — edit it to make it yours.');
  }

  function clearEverything() {
    const ok = window.confirm('This will clear everything you’ve entered. Continue?');
    if (!ok) return;
    setData(emptyResumeData);
    setTouched(new Set());
    showToast('Form cleared.');
  }

  function exportData() {
    const base = data.personal.name.trim().replace(/\s+/g, '_') || 'resume';
    const filename = `${base}_workslab_export.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Resume data exported.');
  }

  function triggerImport() {
    importInputRef.current?.click();
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        showToast("That file isn't valid JSON — import cancelled.");
        return;
      }
      const validated = validateResumeData(parsed);
      if (!validated) {
        showToast("That doesn't look like a Works Lab resume export — import cancelled.");
        return;
      }
      if (!isResumeDataEmpty(data)) {
        const ok = window.confirm('This will replace your current entries with the imported resume. Continue?');
        if (!ok) return;
      }
      setData(validated);
      setTouched(new Set());
      showToast('Resume imported.');
    };
    reader.onerror = () => showToast("Couldn't read that file — import cancelled.");
    reader.readAsText(file);
  }

  const [skillInput, setSkillInput] = useState('');

  function addSkill() {
    const val = skillInput.trim();
    if (!val) return;
    setData((d) => ({ ...d, skills: [...d.skills, val] }));
    setSkillInput('');
  }

  function removeSkill(i: number) {
    setData((d) => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }));
  }

  // Print-based export: a second, print-only copy of the resume is portalled
  // into #print-root (a body-level sibling of #root, see index.html) and
  // window.print() hands it straight to the browser's own print pipeline —
  // a real, text-based, ATS-parseable PDF, unlike the rasterized image
  // html2pdf used to produce. The portal exists because Chromium's print/PDF
  // pipeline emits a blank page for content left inside the on-screen
  // layout: an ancestor that was ever laid out as a CSS Grid (.builder-layout)
  // or an overflow:auto scroll container (.preview-wrapper) fails to repaint
  // for print even after @media print resets display/overflow back to
  // normal — so the resume is printed from an isolated, never-scrolled,
  // never-grid-parented copy instead. We can't detect whether the user
  // actually chose "Save as PDF" or cancelled the dialog, so we don't claim
  // success either way.
  function downloadPDF() {
    showToast('Opening the print dialog — choose "Save as PDF" as the destination.');
    window.print();
  }

  const TemplateComponent = TEMPLATES[template].Component;
  const progress = computeOverallProgress(data);
  const emailInvalid = touched.has('email') && data.personal.email.trim() !== '' && !EMAIL_RE.test(data.personal.email);

  return (
    <>
      <SkipLink />
      <div style={{ overflow: 'hidden' }}>
        <nav>
          <div className="container">
            <div className="nav-inner">
              <Link to="/" className="nav-logo">
                Works<span>Lab</span>
              </Link>
              <div className="builder-nav-actions">
                <span className="builder-nav-template" style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                  Template: <strong style={{ color: 'var(--black)' }}>{TEMPLATES[template].name}</strong>
                </span>
                <span
                  className={`save-indicator state-${saveState === 'idle' ? 'saved' : saveState}`}
                  role="status"
                  aria-live="polite"
                >
                  <span aria-hidden="true">●</span>{' '}
                  <span className="save-indicator-full">
                    {saveState === 'saving' && 'Saving…'}
                    {saveState === 'error' && "Couldn't save — storage unavailable"}
                    {(saveState === 'saved' || saveState === 'idle') &&
                      (savedAt ? 'Saved just now' : 'Auto-saved locally')}
                  </span>
                  <span className="save-indicator-short">
                    {saveState === 'saving' && 'Saving'}
                    {saveState === 'error' && 'Error'}
                    {(saveState === 'saved' || saveState === 'idle') && 'Saved'}
                  </span>
                </span>
                <button
                  className="btn btn-primary builder-nav-download"
                  style={{ padding: '9px 20px', fontSize: '0.88rem' }}
                  onClick={downloadPDF}
                  title='In the dialog that opens, choose "Save as PDF" as the destination.'
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main id="main" tabIndex={-1}>
        <div className="mobile-view-toggle" role="tablist" aria-label="Builder view">
          <button
            type="button"
            role="tab"
            id="mobile-tab-edit"
            aria-controls="mobile-panel-edit"
            aria-selected={mobileView === 'edit'}
            className={mobileView === 'edit' ? 'active' : ''}
            onClick={() => setMobileView('edit')}
          >
            Edit
          </button>
          <button
            type="button"
            role="tab"
            id="mobile-tab-preview"
            aria-controls="mobile-panel-preview"
            aria-selected={mobileView === 'preview'}
            className={mobileView === 'preview' ? 'active' : ''}
            onClick={() => setMobileView('preview')}
          >
            Preview
          </button>
        </div>
        <div className="builder-layout" data-mobile-view={mobileView}>
          {/* FORM PANEL */}
          <div
            className="builder-form-panel"
            ref={formPanelRef}
            role="tabpanel"
            id="mobile-panel-edit"
            aria-labelledby="mobile-tab-edit"
          >
            <div className="builder-form-header">
              <h2>Build Your Resume</h2>
              <p>Your information is saved on this device only.</p>

              <div className="progress-block">
                <div className="progress-row">
                  <div className="progress-bar-track" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Resume completeness">
                    <div className="progress-bar-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <span className="progress-count">
                    {progress.doneCount} of {progress.totalCount} essentials done
                  </span>
                </div>
                {progress.nextAction && <p className="progress-next">{progress.nextAction}</p>}
              </div>

              <div className="form-header-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={loadExample}>
                  Load example resume
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={exportData}>
                  Export JSON
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={triggerImport}>
                  Import JSON
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  aria-label="Import resume JSON file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = '';
                  }}
                />
                <button type="button" className="btn-text-danger" onClick={clearEverything}>
                  Clear everything
                </button>
              </div>

              <SectionNav data={data} containerRef={formPanelRef} />
            </div>

            <div className="builder-sections">
              {/* Personal Info */}
              <div className="form-section" id="section-personal">
                <div className="form-section-title">Personal Information</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="photo">Photo (optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    {data.personal.photo && (
                      <img src={data.personal.photo} alt="Your photo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
                    {data.personal.photo && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => updatePersonal('photo', '')}>Remove</button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input className="form-input" id="name" placeholder="Rahul Sharma" value={data.personal.name} onChange={(e) => updatePersonal('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Professional Title</label>
                  <input className="form-input" id="title" placeholder="Software Engineer" value={data.personal.title} onChange={(e) => updatePersonal('title', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      className="form-input"
                      id="email"
                      type="email"
                      placeholder="rahul@email.com"
                      value={data.personal.email}
                      onChange={(e) => updatePersonal('email', e.target.value)}
                      onBlur={() => markTouched('email')}
                      aria-invalid={emailInvalid || undefined}
                      aria-describedby={emailInvalid ? 'email-error' : undefined}
                    />
                    {emailInvalid && (
                      <p className="field-error" id="email-error">
                        That doesn't look like a valid email address.
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone</label>
                    <input className="form-input" id="phone" placeholder="+91 98765 43210" value={data.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input className="form-input" id="location" placeholder="Bengaluru, India" value={data.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedin">LinkedIn</label>
                    <input className="form-input" id="linkedin" placeholder="linkedin.com/in/yourname" value={data.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolio">GitHub / Portfolio</label>
                    <input className="form-input" id="portfolio" placeholder="github.com/yourname" value={data.personal.portfolio} onChange={(e) => updatePersonal('portfolio', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="form-section" id="section-summary">
                <div className="form-section-title">Professional Summary</div>
                <div className="form-group">
                  <p className="field-hint" id="summary-hint">
                    2–3 sentences: your role, years of experience, and the kind of work you want next.
                  </p>
                  <textarea
                    className="form-textarea"
                    id="summary"
                    rows={4}
                    placeholder="Write 2-3 sentences about your professional background, key skills, and what you bring to the role..."
                    value={data.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    aria-describedby="summary-hint"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="form-section" id="section-experience">
                <div className="form-section-title">Work Experience</div>
                <p className="field-hint" id="experience-hint">
                  Start each line with an action verb and include a number where you can — &ldquo;Cut checkout
                  drop-off by 18%&rdquo; beats &ldquo;Worked on checkout&rdquo;.
                </p>
                {data.experience.map((exp, i) => {
                  const companyKey = `exp-${i}-company`;
                  const titleKey = `exp-${i}-title`;
                  const titleMissing = touched.has(titleKey) && exp.company.trim() !== '' && exp.title.trim() === '';
                  const companyMissing = touched.has(companyKey) && exp.title.trim() !== '' && exp.company.trim() === '';
                  return (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Experience {i + 1}</div>
                      <div className="entry-card-actions">
                        {i > 0 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('experience', i, 'up')}
                            aria-label="Move up"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {i < data.experience.length - 1 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('experience', i, 'down')}
                            aria-label="Move down"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button className="btn-remove" onClick={() => removeEntry('experience', i)}>Remove</button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                          className="form-input"
                          placeholder="Infosys"
                          value={exp.company}
                          onChange={(e) => updateEntry('experience', i, 'company', e.target.value)}
                          onBlur={() => markTouched(companyKey)}
                          aria-invalid={companyMissing || undefined}
                          aria-describedby={companyMissing ? `${companyKey}-error` : undefined}
                        />
                        {companyMissing && (
                          <p className="field-error" id={`${companyKey}-error`}>Add the company name.</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input
                          className="form-input"
                          placeholder="Software Engineer"
                          value={exp.title}
                          onChange={(e) => updateEntry('experience', i, 'title', e.target.value)}
                          onBlur={() => markTouched(titleKey)}
                          aria-invalid={titleMissing || undefined}
                          aria-describedby={titleMissing ? `${titleKey}-error` : undefined}
                        />
                        {titleMissing && (
                          <p className="field-error" id={`${titleKey}-error`}>Add the job title.</p>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input className="form-input" placeholder="Bengaluru, India" value={exp.location} onChange={(e) => updateEntry('experience', i, 'location', e.target.value)} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input className="form-input" placeholder="Jun 2022" value={exp.start} onChange={(e) => updateEntry('experience', i, 'start', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          className="form-input"
                          placeholder="Present"
                          value={exp.end}
                          onChange={(e) => updateEntry('experience', i, 'end', e.target.value)}
                          disabled={exp.end === 'Present'}
                        />
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={exp.end === 'Present'}
                            onChange={(e) => updateEntry('experience', i, 'end', e.target.checked ? 'Present' : '')}
                            aria-label="Currently working here"
                          />
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Responsibilities</label>
                      <p className="field-hint">Start lines with • to create bullet points. Press Enter to continue the list.</p>
                      <div className="textarea-wrapper">
                        <button
                          type="button"
                          className="btn-add-bullet"
                          onClick={() => handleAddBullet('experience', i, `exp-desc-${i}`)}
                          onMouseDown={(e) => e.preventDefault()}
                          aria-label="Add bullet point"
                          title="Add bullet point"
                        >
                          • Add bullet
                        </button>
                        <textarea
                          id={`exp-desc-${i}`}
                          className="form-textarea"
                          placeholder="• Start lines with a bullet to create a list&#10;• Or write a paragraph normally&#10;• Mixing bullets and text is fine"
                          value={exp.description}
                          onChange={(e) => updateEntry('experience', i, 'description', e.target.value)}
                          onKeyDown={(e) => handleBulletKeydown(e, 'experience', i)}
                        />
                      </div>
                    </div>
                  </div>
                  );
                })}
                <button
                  className="btn-add-entry"
                  onClick={() =>
                    addEntry('experience', { company: '', title: '', location: '', start: '', end: '', description: '' } as ExperienceEntry)
                  }
                >
                  + Add Work Experience
                </button>
              </div>

              {/* Education */}
              <div className="form-section" id="section-education">
                <div className="form-section-title">Education</div>
                {data.education.map((edu, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Education {i + 1}</div>
                      <div className="entry-card-actions">
                        {i > 0 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('education', i, 'up')}
                            aria-label="Move up"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {i < data.education.length - 1 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('education', i, 'down')}
                            aria-label="Move down"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button className="btn-remove" onClick={() => removeEntry('education', i)}>Remove</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree / Course</label>
                      <input className="form-input" placeholder="B.Tech Computer Science" value={edu.degree} onChange={(e) => updateEntry('education', i, 'degree', e.target.value)} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Institution</label>
                        <input className="form-input" placeholder="IIT Bombay" value={edu.institution} onChange={(e) => updateEntry('education', i, 'institution', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input className="form-input" placeholder="Mumbai" value={edu.location} onChange={(e) => updateEntry('education', i, 'location', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Start Year</label>
                        <input className="form-input" placeholder="2019" value={edu.start} onChange={(e) => updateEntry('education', i, 'start', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Year</label>
                        <input
                          className="form-input"
                          placeholder="2023"
                          value={edu.end}
                          onChange={(e) => updateEntry('education', i, 'end', e.target.value)}
                          disabled={edu.end === 'Present'}
                        />
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={edu.end === 'Present'}
                            onChange={(e) => updateEntry('education', i, 'end', e.target.checked ? 'Present' : '')}
                            aria-label="Currently studying"
                          />
                          Currently studying
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes (GPA / Achievements)</label>
                      <input className="form-input" placeholder="CGPA: 8.5 / Scholarship recipient" value={edu.description} onChange={(e) => updateEntry('education', i, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button
                  className="btn-add-entry"
                  onClick={() =>
                    addEntry('education', { degree: '', institution: '', location: '', start: '', end: '', description: '' } as EducationEntry)
                  }
                >
                  + Add Education
                </button>
              </div>

              {/* Skills */}
              <div className="form-section" id="section-skills">
                <div className="form-section-title">Skills</div>
                <p className="field-hint" id="skills-hint">
                  List tools and skills a recruiter might search for. 8–12 is plenty.
                </p>
                <div className="skill-tags">
                  {data.skills.map((s, i) => (
                    <span className="skill-tag" key={i}>
                      {s} <button onClick={() => removeSkill(i)} aria-label={`Remove ${s}`}>×</button>
                    </span>
                  ))}
                </div>
                <div className="skill-input-row">
                  <input
                    className="form-input"
                    id="skillInput"
                    aria-label="Add a skill"
                    placeholder="e.g. React, Python, Figma..."
                    style={{ margin: 0 }}
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    aria-describedby="skills-hint"
                  />
                  <button className="btn btn-outline btn-sm" onClick={addSkill}>Add</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '6px' }}>
                  Press Enter or click Add to add each skill.
                </p>
              </div>

              {/* Projects */}
              <div className="form-section" id="section-projects">
                <div className="form-section-title">Projects <span>(optional)</span></div>
                {data.projects.map((pr, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Project {i + 1}</div>
                      <div className="entry-card-actions">
                        {i > 0 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('projects', i, 'up')}
                            aria-label="Move up"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {i < data.projects.length - 1 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('projects', i, 'down')}
                            aria-label="Move down"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button className="btn-remove" onClick={() => removeEntry('projects', i)}>Remove</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Name</label>
                      <input className="form-input" placeholder="E-commerce Platform" value={pr.name} onChange={(e) => updateEntry('projects', i, 'name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Technologies Used</label>
                      <input className="form-input" placeholder="React, Node.js, MongoDB" value={pr.tech} onChange={(e) => updateEntry('projects', i, 'tech', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project URL (optional)</label>
                      <input className="form-input" placeholder="github.com/username/project" value={pr.url} onChange={(e) => updateEntry('projects', i, 'url', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <p className="field-hint">Start lines with • to create bullet points. Press Enter to continue the list.</p>
                      <div className="textarea-wrapper">
                        <button
                          type="button"
                          className="btn-add-bullet"
                          onClick={() => handleAddBullet('projects', i, `pr-desc-${i}`)}
                          onMouseDown={(e) => e.preventDefault()}
                          aria-label="Add bullet point"
                          title="Add bullet point"
                        >
                          • Add bullet
                        </button>
                        <textarea
                          id={`pr-desc-${i}`}
                          className="form-textarea"
                          placeholder="• Start lines with a bullet to create a list&#10;• Or write a paragraph normally&#10;• Mixing bullets and text is fine"
                          value={pr.description}
                          onChange={(e) => updateEntry('projects', i, 'description', e.target.value)}
                          onKeyDown={(e) => handleBulletKeydown(e, 'projects', i)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn-add-entry"
                  onClick={() => addEntry('projects', { name: '', tech: '', url: '', description: '' } as ProjectEntry)}
                >
                  + Add Project
                </button>
              </div>

              {/* Certifications */}
              <div className="form-section" id="section-certifications">
                <div className="form-section-title">Certifications <span>(optional)</span></div>
                {data.certifications.map((cert, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Certification {i + 1}</div>
                      <div className="entry-card-actions">
                        {i > 0 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('certifications', i, 'up')}
                            aria-label="Move up"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {i < data.certifications.length - 1 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('certifications', i, 'down')}
                            aria-label="Move down"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button className="btn-remove" onClick={() => removeEntry('certifications', i)}>Remove</button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Certification Name</label>
                        <input className="form-input" placeholder="AWS Cloud Practitioner" value={cert.name} onChange={(e) => updateEntry('certifications', i, 'name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issuing Organization</label>
                        <input className="form-input" placeholder="Amazon Web Services" value={cert.org} onChange={(e) => updateEntry('certifications', i, 'org', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Year</label>
                        <input className="form-input" placeholder="2024" value={cert.year} onChange={(e) => updateEntry('certifications', i, 'year', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Credential URL (optional)</label>
                        <input className="form-input" placeholder="credly.com/badges/..." value={cert.url} onChange={(e) => updateEntry('certifications', i, 'url', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn-add-entry"
                  onClick={() => addEntry('certifications', { name: '', org: '', year: '', url: '' } as CertificationEntry)}
                >
                  + Add Certification
                </button>
              </div>

              {/* Languages */}
              <div className="form-section" id="section-languages">
                <div className="form-section-title">Languages <span>(optional)</span></div>
                {data.languages.map((lang, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Language {i + 1}</div>
                      <div className="entry-card-actions">
                        {i > 0 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('languages', i, 'up')}
                            aria-label="Move up"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {i < data.languages.length - 1 && (
                          <button
                            className="btn-move"
                            onClick={() => moveEntry('languages', i, 'down')}
                            aria-label="Move down"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button className="btn-remove" onClick={() => removeEntry('languages', i)}>Remove</button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Language</label>
                        <input className="form-input" placeholder="Hindi" value={lang.lang} onChange={(e) => updateEntry('languages', i, 'lang', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Level</label>
                        <select className="form-select" value={lang.level} onChange={(e) => updateEntry('languages', i, 'level', e.target.value)}>
                          <option value="">Select level</option>
                          {LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn-add-entry"
                  onClick={() => addEntry('languages', { lang: '', level: '' } as LanguageEntry)}
                >
                  + Add Language
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div
            className="builder-preview-panel"
            role="tabpanel"
            id="mobile-panel-preview"
            aria-labelledby="mobile-tab-preview"
          >
            <div className="preview-header">
              <span className="preview-title">Live Preview</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem' }}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as TemplateKey)}
                  aria-label="Choose template"
                >
                  {Object.values(TEMPLATES).map((t) => (
                    <option key={t.key} value={t.key}>{t.name}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary preview-header-download"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                  onClick={downloadPDF}
                  title='In the dialog that opens, choose "Save as PDF" as the destination.'
                >
                  ⬇ Download PDF
                </button>
              </div>
            </div>

            <p className="print-hint">
              This opens your browser's print dialog — choose <strong>Save as PDF</strong> as the destination.
            </p>

            {pageCount > 1 && (
              <p className="page-count-notice">
                {pageCount} pages — recruiters prefer 1 page for under 10 years of experience.
              </p>
            )}

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
                    <TemplateComponent data={data} />
                  </div>

                  {/* Page-break indicators: a sibling of previewRef, and
                      screen-only — the print export uses a separate portal
                      (see the bottom of this component), never this node. */}
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

      {/* Print-only portal (see downloadPDF() above for why this can't just
          be the on-screen .a4-page node). #print-root is a body-level
          sibling of #root defined in index.html and is display:none on
          screen — visible only under @media print. */}
      {document.getElementById('print-root') &&
        createPortal(
          <div className="print-resume-page">
            <TemplateComponent data={data} />
          </div>,
          document.getElementById('print-root')!,
        )}
    </>
  );
}
