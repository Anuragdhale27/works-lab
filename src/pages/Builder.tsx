import { useEffect, useRef, useState } from 'react';
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
import type { TemplateKey } from '../types/resume';
import { TEMPLATES, isTemplateKey } from '../templates';
import { loadResumeData, saveResumeData } from '../lib/storage';
import { SkipLink } from '../components/SkipLink';
import { useToast } from '../components/ToastProvider';

const LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

export function Builder() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Lazy init so the first save can never overwrite stored data with the empty default (StrictMode re-runs effects).
  const [data, setData] = useState<ResumeData>(loadResumeData);
  const [template, setTemplate] = useState<TemplateKey>(() => {
    const t = searchParams.get('template');
    return isTemplateKey(t ?? undefined) ? (t as TemplateKey) : 'modern';
  });
  const [downloading, setDownloading] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Persist on every change.
  useEffect(() => {
    saveResumeData(data);
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

  async function downloadPDF() {
    const el = previewRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      // Capture at real A4 width, with height rounded up to whole pages (minus 1px so rounding
      // never adds a blank page), so Executive/Minimal backgrounds fill every page.
      const root = el.firstElementChild as HTMLElement | null; // the template root carries its own background
      const prev = { width: el.style.width, minHeight: el.style.minHeight, background: el.style.background, rootMin: root?.style.minHeight ?? '' };
      el.style.width = '210mm';
      el.style.minHeight = '0';
      const pagePx = (el.offsetWidth * 297) / 210;
      const fullHeight = `${Math.max(1, Math.ceil((el.scrollHeight - 1) / pagePx)) * pagePx - 1}px`;
      el.style.minHeight = fullHeight;
      if (root) root.style.minHeight = fullHeight;
      // The wrapper carries the page background so it continues below the template root.
      if (template === 'executive') el.style.background = '#0d0d0d';
      if (template === 'minimal') el.style.background = 'linear-gradient(to right, #eef6f5 167px, #0f766e 167px 170px, #fff 170px)';
      const opt = {
        margin: 0,
        filename: `${(data.personal.name.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'resume')}_resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      try {
        await html2pdf().set(opt).from(el).save();
      } finally {
        el.style.width = prev.width;
        el.style.minHeight = prev.minHeight;
        el.style.background = prev.background;
        if (root) root.style.minHeight = prev.rootMin;
      }
      showToast('Resume downloaded!');
    } catch {
      showToast('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const TemplateComponent = TEMPLATES[template].Component;

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
              <div className="builder-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="builder-nav-meta" style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
                  Template: <strong style={{ color: 'var(--black)' }}>{TEMPLATES[template].name}</strong>
                </span>
                <span className="builder-nav-meta" style={{ fontSize: '0.75rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span aria-hidden="true">●</span> Auto-saved
                </span>
                <button
                  className="btn btn-primary"
                  style={{ padding: '9px 20px', fontSize: '0.88rem' }}
                  onClick={downloadPDF}
                  disabled={downloading}
                >
                  {downloading ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main id="main" tabIndex={-1}>
        <div className="builder-layout">
          {/* FORM PANEL */}
          <div className="builder-form-panel">
            <div className="builder-form-header">
              <h2>Build Your Resume</h2>
              <p>Your information is saved on this device only.</p>
            </div>

            <div className="builder-sections">
              {/* Personal Info */}
              <div className="form-section">
                <div className="form-section-title">Personal Information</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="photo">Photo (optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    {data.personal.photo && (
                      <img src={data.personal.photo} alt="Your photo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
                    {data.personal.photo && (
                      <button type="button" className="btn" onClick={() => updatePersonal('photo', '')}>Remove</button>
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
                    <input className="form-input" id="email" type="email" placeholder="rahul@email.com" value={data.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} />
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
              <div className="form-section">
                <div className="form-section-title">Professional Summary</div>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    id="summary"
                    rows={4}
                    placeholder="Write 2-3 sentences about your professional background, key skills, and what you bring to the role..."
                    value={data.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="form-section">
                <div className="form-section-title">Work Experience</div>
                {data.experience.map((exp, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Experience {i + 1}</div>
                      <button className="btn-remove" onClick={() => removeEntry('experience', i)}>Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input className="form-input" placeholder="Infosys" value={exp.company} onChange={(e) => updateEntry('experience', i, 'company', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input className="form-input" placeholder="Software Engineer" value={exp.title} onChange={(e) => updateEntry('experience', i, 'title', e.target.value)} />
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
                        <input className="form-input" placeholder="Present" value={exp.end} onChange={(e) => updateEntry('experience', i, 'end', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Responsibilities</label>
                      <textarea className="form-textarea" placeholder="Describe your role and achievements..." value={exp.description} onChange={(e) => updateEntry('experience', i, 'description', e.target.value)} />
                    </div>
                  </div>
                ))}
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
              <div className="form-section">
                <div className="form-section-title">Education</div>
                {data.education.map((edu, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Education {i + 1}</div>
                      <button className="btn-remove" onClick={() => removeEntry('education', i)}>Remove</button>
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
                        <input className="form-input" placeholder="2023" value={edu.end} onChange={(e) => updateEntry('education', i, 'end', e.target.value)} />
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
              <div className="form-section">
                <div className="form-section-title">Skills</div>
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
                  />
                  <button className="btn btn-outline btn-sm" onClick={addSkill}>Add</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '6px' }}>
                  Press Enter or click Add to add each skill.
                </p>
              </div>

              {/* Projects */}
              <div className="form-section">
                <div className="form-section-title">Projects <span>(optional)</span></div>
                {data.projects.map((pr, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Project {i + 1}</div>
                      <button className="btn-remove" onClick={() => removeEntry('projects', i)}>Remove</button>
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
                      <textarea className="form-textarea" placeholder="What you built and what it achieved..." value={pr.description} onChange={(e) => updateEntry('projects', i, 'description', e.target.value)} />
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
              <div className="form-section">
                <div className="form-section-title">Certifications <span>(optional)</span></div>
                {data.certifications.map((cert, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Certification {i + 1}</div>
                      <button className="btn-remove" onClick={() => removeEntry('certifications', i)}>Remove</button>
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
              <div className="form-section">
                <div className="form-section-title">Languages <span>(optional)</span></div>
                {data.languages.map((lang, i) => (
                  <div className="entry-card" key={i}>
                    <div className="entry-card-header">
                      <div className="entry-card-title">Language {i + 1}</div>
                      <button className="btn-remove" onClick={() => removeEntry('languages', i)}>Remove</button>
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
          <div className="builder-preview-panel">
            <div className="preview-header">
              <span className="preview-title">Live Preview</span>
              <div style={{ display: 'flex', gap: '8px' }}>
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
                <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }} onClick={downloadPDF} disabled={downloading}>
                  ⬇ {downloading ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
            <div className="preview-wrapper" style={{ overflow: 'hidden' }}>
              <div ref={previewRef} style={{ transformOrigin: 'top left', minHeight: '297mm' }}>
                <TemplateComponent data={data} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
