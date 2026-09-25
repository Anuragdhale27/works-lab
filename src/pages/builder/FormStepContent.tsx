import type {
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  LanguageEntry,
  AwardEntry,
} from '../../types/resume';
import { EntryListEditor } from './EntryListEditor';
import { PhotoUpload } from './PhotoUpload';
import {
  experienceConfig,
  educationConfig,
  projectsConfig,
  certificationsConfig,
  languagesConfig,
  awardsConfig,
  customSectionItemConfig,
} from './sectionConfigs';
import {
  experienceTitle,
  educationTitle,
  projectTitle,
  certificationTitle,
  languageTitle,
  awardTitle,
  customItemTitle,
} from './entryTitles';
import type { ResumeEditorState } from './useResumeEditor';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormStepContentProps {
  editor: ResumeEditorState;
  currentStepKey: string;
  showToast: (message: string) => void;
  onAddBullet: (sectionKey: 'experience' | 'education' | 'projects', entryIndex: number, textarea: HTMLTextAreaElement) => void;
  onBulletKeydown: (e: React.KeyboardEvent<HTMLTextAreaElement>, sectionKey: 'experience' | 'education' | 'projects', entryIndex: number) => void;
  onAddBulletCustom: (customId: string, itemIndex: number, textarea: HTMLTextAreaElement) => void;
  onBulletKeydownCustom: (e: React.KeyboardEvent<HTMLTextAreaElement>, customId: string, itemIndex: number) => void;
}

export function FormStepContent({
  editor,
  currentStepKey,
  showToast,
  onAddBullet,
  onBulletKeydown,
  onAddBulletCustom,
  onBulletKeydownCustom,
}: FormStepContentProps) {
  const emailInvalid = editor.touched.has('email') && editor.data.personal.email.trim() !== '' && !EMAIL_RE.test(editor.data.personal.email);

  if (currentStepKey === 'personal') {
    return (
      <div className="form-section">
        <div className="form-group">
          <label className="form-label" htmlFor="photo">Photo (optional)</label>
          <PhotoUpload photo={editor.data.personal.photo} onPhotoChange={(v) => editor.updatePersonal('photo', v)} showToast={showToast} />
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
    );
  }

  if (currentStepKey === 'summary') {
    return (
      <div className="form-section">
        <div className="form-group">
          <textarea
            className="form-textarea"
            id="summary"
            rows={6}
            placeholder="Write 2-3 sentences about your professional background, key skills, and what you bring to the role..."
            value={editor.data.summary}
            onChange={(e) => editor.updateSummary(e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (currentStepKey === 'experience') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.experience}
          config={experienceConfig}
          entryTitle={experienceTitle}
          addButtonLabel="+ Add Work Experience"
          idPrefix="experience"
          onAdd={() => editor.addEntry('experience', { company: '', title: '', location: '', start: '', end: '', description: '' } as ExperienceEntry)}
          onUpdate={(i, f, v) => editor.updateEntry('experience', i, f, v)}
          onRemove={(i) => editor.removeEntry('experience', i)}
          onMove={(i, d) => editor.moveEntry('experience', i, d)}
          onDuplicate={(i) => editor.duplicateEntryFn('experience', i)}
          onAddBullet={(i, _, textarea) => onAddBullet('experience', i, textarea)}
          onBulletKeydown={(e, i) => onBulletKeydown(e, 'experience', i)}
          touched={editor.touched}
          onMarkTouched={editor.markTouched}
        />
      </div>
    );
  }

  if (currentStepKey === 'education') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.education}
          config={educationConfig}
          entryTitle={educationTitle}
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
    );
  }

  if (currentStepKey === 'skills') {
    return (
      <div className="form-section">
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
          />
          <button className="btn btn-outline btn-sm" onClick={() => {
            const input = document.getElementById('skillInput') as HTMLInputElement;
            if (input) {
              editor.addSkill(input.value);
              input.value = '';
            }
          }}>Add</button>
        </div>
        <p className="skill-help">Press Enter or click Add to add each skill.</p>
      </div>
    );
  }

  if (currentStepKey === 'projects') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.projects}
          config={projectsConfig}
          entryTitle={projectTitle}
          addButtonLabel="+ Add Project"
          idPrefix="projects"
          onAdd={() => editor.addEntry('projects', { name: '', tech: '', url: '', description: '' } as ProjectEntry)}
          onUpdate={(i, f, v) => editor.updateEntry('projects', i, f, v)}
          onRemove={(i) => editor.removeEntry('projects', i)}
          onMove={(i, d) => editor.moveEntry('projects', i, d)}
          onDuplicate={(i) => editor.duplicateEntryFn('projects', i)}
          onAddBullet={(i, _, textarea) => onAddBullet('projects', i, textarea)}
          onBulletKeydown={(e, i) => onBulletKeydown(e, 'projects', i)}
          touched={editor.touched}
          onMarkTouched={editor.markTouched}
        />
      </div>
    );
  }

  if (currentStepKey === 'certifications') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.certifications}
          config={certificationsConfig}
          entryTitle={certificationTitle}
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
    );
  }

  if (currentStepKey === 'languages') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.languages}
          config={languagesConfig}
          entryTitle={languageTitle}
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
    );
  }

  if (currentStepKey === 'awards') {
    return (
      <div className="form-section">
        <EntryListEditor
          items={editor.data.awards}
          config={awardsConfig}
          entryTitle={awardTitle}
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
    );
  }

  if (currentStepKey.startsWith('custom:')) {
    const customId = currentStepKey.slice(7);
    const customSection = editor.data.customSections.find((c) => c.id === customId);
    if (!customSection) return null;
    return (
      <div className="form-section">
        <div className="form-section-title-with-actions">
          <input
            className="form-input custom-section-title-input"
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
          entryTitle={customItemTitle}
          addButtonLabel="+ Add Item"
          idPrefix={`custom-${customSection.id}`}
          onAdd={() => editor.addCustomItem(customSection.id)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onUpdate={(i, f, v) => editor.updateCustomItem(customSection.id, i, f as any, v)}
          onRemove={(i) => editor.removeCustomItem(customSection.id, i)}
          onMove={(i, d) => editor.moveCustomItem(customSection.id, i, d)}
          onDuplicate={(i) => editor.duplicateCustomItem(customSection.id, i)}
          onAddBullet={(i, _, textarea) => onAddBulletCustom(customSection.id, i, textarea)}
          onBulletKeydown={(e, i) => onBulletKeydownCustom(e, customSection.id, i)}
        />
      </div>
    );
  }

  return null;
}
