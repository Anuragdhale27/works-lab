import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import type { TemplateKey } from '../types/resume';
import type {
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  LanguageEntry,
  AwardEntry,
} from '../types/resume';
import { TEMPLATES, isTemplateKey } from '../templates';
import { resolveSectionOrder, moveSection as moveSectionOrder } from '../lib/sectionOrder';
import { SkipLink } from '../components/SkipLink';
import { useToast } from '../components/ToastProvider';
import { SectionNav } from '../components/SectionNav';
import { useResumeEditor } from './builder/useResumeEditor';
import { EntryListEditor } from './builder/EntryListEditor';
import { BuilderTopBar } from './builder/BuilderTopBar';
import { StepNav } from './builder/StepNav';
import { DesignDrawer } from './builder/DesignDrawer';
import { SectionOrderPanel } from './builder/SectionOrderPanel';
import {
  experienceConfig,
  educationConfig,
  projectsConfig,
  certificationsConfig,
  languagesConfig,
  awardsConfig,
  customSectionItemConfig,
} from './builder/sectionConfigs';
import './builder/builder.css';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const ZOOM_STEPS = [0.5, 0.75, 1] as const;
type ZoomMode = 'fit' | (typeof ZOOM_STEPS)[number];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Builder() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const editor = useResumeEditor();

  const [template, setTemplate] = useState<TemplateKey>(() => {
    const t = searchParams.get('template');
    return isTemplateKey(t ?? undefined) ? (t as TemplateKey) : 'modern';
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const designButtonRef = useRef<HTMLButtonElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [fitScale, setFitScale] = useState(1);
  const scale = zoomMode === 'fit' ? fitScale : zoomMode;
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);
  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT_PX));

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

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    const padding = 16;
    const available = Math.max(0, w - padding);
    setFitScale(Math.min(1, available / A4_WIDTH_PX));
  }, [mobileView]);

  // Content height measurement
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

  const TemplateComponent = TEMPLATES[template].Component;
  const emailInvalid = editor.touched.has('email') && editor.data.personal.email.trim() !== '' && !EMAIL_RE.test(editor.data.personal.email);

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

        <StepNav data={editor.data} containerRef={formPanelRef} />

        <main id="main" tabIndex={-1} className="builder-main">
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
        <div className="builder-panels" data-mobile-view={mobileView}>
          {/* FORM PANEL */}
          <div
            className="builder-form-panel"
            ref={formPanelRef}
            role="tabpanel"
            id="mobile-panel-edit"
            aria-labelledby="mobile-tab-edit"
          >
            <div className="builder-form-header">
              <h2>Build your resume</h2>
              <p>Saved on this device only.</p>

              <SectionNav data={editor.data} containerRef={formPanelRef} />
            </div>

            <div className="builder-sections">
              {/* Personal Info */}
              <div className="form-section" id="section-personal">
                <div className="form-section-title">Personal Information</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="photo">Photo (optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    {editor.data.personal.photo && (
                      <img src={editor.data.personal.photo} alt="Your photo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return showToast('Please choose a JPG, PNG or WebP image.');
                      if (file.size > 5 * 1024 * 1024) return showToast('Photo must be under 5 MB.');
                      const url = URL.createObjectURL(file);
                      const img = new Image();
                      img.onload = () => {
                        const side = Math.min(img.width, img.height);
                        const size = Math.min(240, side);
                        const canvas = document.createElement('canvas');
                        canvas.width = canvas.height = size;
                        canvas.getContext('2d')?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
                        editor.updatePersonal('photo', canvas.toDataURL('image/jpeg', 0.85));
                        URL.revokeObjectURL(url);
                      };
                      img.onerror = () => {
                        URL.revokeObjectURL(url);
                        showToast('Could not read that image.');
                      };
                      img.src = url;
                    }} />
                    {editor.data.personal.photo && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => editor.updatePersonal('photo', '')}>Remove</button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input className="form-input" id="name" placeholder="Rahul Sharma" value={editor.data.personal.name} onChange={(e) => editor.updatePersonal('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Professional Title</label>
                  <input className="form-input" id="title" placeholder="Software Engineer" value={editor.data.personal.title} onChange={(e) => editor.updatePersonal('title', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      className="form-input"
                      id="email"
                      type="email"
                      placeholder="rahul@email.com"
                      value={editor.data.personal.email}
                      onChange={(e) => editor.updatePersonal('email', e.target.value)}
                      onBlur={() => editor.markTouched('email')}
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
                    <input className="form-input" id="phone" placeholder="+91 98765 43210" value={editor.data.personal.phone} onChange={(e) => editor.updatePersonal('phone', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input className="form-input" id="location" placeholder="Bengaluru, India" value={editor.data.personal.location} onChange={(e) => editor.updatePersonal('location', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedin">LinkedIn</label>
                    <input className="form-input" id="linkedin" placeholder="linkedin.com/in/yourname" value={editor.data.personal.linkedin} onChange={(e) => editor.updatePersonal('linkedin', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolio">GitHub / Portfolio</label>
                    <input className="form-input" id="portfolio" placeholder="github.com/yourname" value={editor.data.personal.portfolio} onChange={(e) => editor.updatePersonal('portfolio', e.target.value)} />
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
                    value={editor.data.summary}
                    onChange={(e) => editor.updateSummary(e.target.value)}
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
                <EntryListEditor
                  items={editor.data.experience}
                  config={experienceConfig}
                  itemTitleFn={(_, i) => `Experience ${i + 1}`}
                  addButtonLabel="+ Add Work Experience"
                  idPrefix="experience"
                  onAdd={() => editor.addEntry('experience', { company: '', title: '', location: '', start: '', end: '', description: '' } as ExperienceEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('experience', i, f, v)}
                  onRemove={(i) => editor.removeEntry('experience', i)}
                  onMove={(i, d) => editor.moveEntry('experience', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('experience', i)}
                  onAddBullet={(i, _, textarea) => handleAddBullet('experience', i, textarea)}
                  onBulletKeydown={(e, i) => handleBulletKeydown(e, 'experience', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Education */}
              <div className="form-section" id="section-education">
                <div className="form-section-title">Education</div>
                <EntryListEditor
                  items={editor.data.education}
                  config={educationConfig}
                  itemTitleFn={(_, i) => `Education ${i + 1}`}
                  addButtonLabel="+ Add Education"
                  idPrefix="education"
                  onAdd={() => editor.addEntry('education', { degree: '', institution: '', location: '', start: '', end: '', description: '' } as EducationEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('education', i, f, v)}
                  onRemove={(i) => editor.removeEntry('education', i)}
                  onMove={(i, d) => editor.moveEntry('education', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('education', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Skills */}
              <div className="form-section" id="section-skills">
                <div className="form-section-title">Skills</div>
                <p className="field-hint" id="skills-hint">
                  List tools and skills a recruiter might search for. 8–12 is plenty.
                </p>
                <div className="skill-tags">
                  {editor.data.skills.map((s, i) => (
                    <span className="skill-tag" key={i}>
                      {s} <button onClick={() => editor.removeSkill(i)} aria-label={`Remove ${s}`}>×</button>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget as HTMLInputElement;
                        editor.addSkill(input.value);
                        input.value = '';
                      }
                    }}
                    aria-describedby="skills-hint"
                  />
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    const input = document.getElementById('skillInput') as HTMLInputElement;
                    if (input) {
                      editor.addSkill(input.value);
                      input.value = '';
                    }
                  }}>Add</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '6px' }}>
                  Press Enter or click Add to add each skill.
                </p>
              </div>

              {/* Projects */}
              <div className="form-section" id="section-projects">
                <div className="form-section-title">Projects <span>(optional)</span></div>
                <EntryListEditor
                  items={editor.data.projects}
                  config={projectsConfig}
                  itemTitleFn={(_, i) => `Project ${i + 1}`}
                  addButtonLabel="+ Add Project"
                  idPrefix="projects"
                  onAdd={() => editor.addEntry('projects', { name: '', tech: '', url: '', description: '' } as ProjectEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('projects', i, f, v)}
                  onRemove={(i) => editor.removeEntry('projects', i)}
                  onMove={(i, d) => editor.moveEntry('projects', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('projects', i)}
                  onAddBullet={(i, _, textarea) => handleAddBullet('projects', i, textarea)}
                  onBulletKeydown={(e, i) => handleBulletKeydown(e, 'projects', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Certifications */}
              <div className="form-section" id="section-certifications">
                <div className="form-section-title">Certifications <span>(optional)</span></div>
                <EntryListEditor
                  items={editor.data.certifications}
                  config={certificationsConfig}
                  itemTitleFn={(_, i) => `Certification ${i + 1}`}
                  addButtonLabel="+ Add Certification"
                  idPrefix="certifications"
                  onAdd={() => editor.addEntry('certifications', { name: '', org: '', year: '', url: '' } as CertificationEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('certifications', i, f, v)}
                  onRemove={(i) => editor.removeEntry('certifications', i)}
                  onMove={(i, d) => editor.moveEntry('certifications', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('certifications', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Languages */}
              <div className="form-section" id="section-languages">
                <div className="form-section-title">Languages <span>(optional)</span></div>
                <EntryListEditor
                  items={editor.data.languages}
                  config={languagesConfig}
                  itemTitleFn={(_, i) => `Language ${i + 1}`}
                  addButtonLabel="+ Add Language"
                  idPrefix="languages"
                  onAdd={() => editor.addEntry('languages', { lang: '', level: '' } as LanguageEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('languages', i, f, v)}
                  onRemove={(i) => editor.removeEntry('languages', i)}
                  onMove={(i, d) => editor.moveEntry('languages', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('languages', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Awards & Achievements */}
              <div className="form-section" id="section-awards">
                <div className="form-section-title">Awards & Achievements <span>(optional)</span></div>
                <EntryListEditor
                  items={editor.data.awards}
                  config={awardsConfig}
                  itemTitleFn={(_, i) => `Award ${i + 1}`}
                  addButtonLabel="+ Add Award"
                  idPrefix="awards"
                  onAdd={() => editor.addEntry('awards', { title: '', issuer: '', year: '', description: '' } as AwardEntry)}
                  onUpdate={(i, f, v) => editor.updateEntry('awards', i, f, v)}
                  onRemove={(i) => editor.removeEntry('awards', i)}
                  onMove={(i, d) => editor.moveEntry('awards', i, d)}
                  onDuplicate={(i) => editor.duplicateEntryFn('awards', i)}
                  touched={editor.touched}
                  onMarkTouched={editor.markTouched}
                />
              </div>

              {/* Custom Sections */}
              {editor.data.customSections.map((customSection) => (
                <div className="form-section" id={`section-custom-${customSection.id}`} key={customSection.id}>
                  <div className="form-section-title-with-actions">
                    <input
                      className="form-input"
                      style={{ marginBottom: '0', fontSize: '1.1rem', fontWeight: '600' }}
                      placeholder="e.g. Volunteering, Publications, Hobbies"
                      value={customSection.title}
                      onChange={(e) => editor.updateCustomSection(customSection.id, 'title', e.target.value)}
                      aria-label="Section title"
                    />
                    <button
                      className="btn-remove"
                      onClick={() => {
                        const ok = window.confirm('Delete this entire section?');
                        if (ok) editor.removeCustomSection(customSection.id);
                      }}
                      title="Delete section"
                    >
                      Delete section
                    </button>
                  </div>

                  <EntryListEditor
                    items={customSection.items}
                    config={customSectionItemConfig}
                    itemTitleFn={(_, i) => `Item ${i + 1}`}
                    addButtonLabel="+ Add Item"
                    idPrefix={`custom-${customSection.id}`}
                    onAdd={() => editor.addCustomItem(customSection.id)}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onUpdate={(i, f, v) => editor.updateCustomItem(customSection.id, i, f as any, v)}
                    onRemove={(i) => editor.removeCustomItem(customSection.id, i)}
                    onMove={(i, d) => editor.moveCustomItem(customSection.id, i, d)}
                    onDuplicate={(i) => editor.duplicateCustomItem(customSection.id, i)}
                    onAddBullet={(i, _, textarea) => handleAddBulletCustom(customSection.id, i, textarea)}
                    onBulletKeydown={(e, i) => handleBulletKeydownCustom(e, customSection.id, i)}
                  />
                </div>
              ))}

              {/* Add Custom Section Button */}
              <div className="form-section" style={{ paddingTop: '8px', paddingBottom: '8px', border: 'none', backgroundColor: 'transparent' }}>
                <button className="btn-add-entry" onClick={editor.addCustomSection}>
                  + Add Custom Section
                </button>
              </div>
            </div>

            <SectionOrderPanel
              data={editor.data}
              template={template}
              onMoveSection={handleMoveSection}
              onResetOrder={handleResetSectionOrder}
            />
          </div>

          {/* PREVIEW PANEL */}
          <div
            className="builder-preview-panel"
            role="tabpanel"
            id="mobile-panel-preview"
            aria-labelledby="mobile-tab-preview"
          >
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

        <DesignDrawer
          isOpen={isDesignOpen}
          template={template}
          data={editor.data}
          onTemplateChange={setTemplate}
          onAccentChange={(accent) => editor.setData({ ...editor.data, accent }, true)}
          onClose={() => setIsDesignOpen(false)}
          triggerRef={designButtonRef}
        />
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
