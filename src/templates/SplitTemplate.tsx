import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveColumns } from '../lib/sectionColumns';

const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects',
  awards: 'Awards & Achievements',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  certifications: 'Certifications',
};

export function SplitTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const { main: mainSections, side: sidebarSections } = resolveColumns(data, 'split');
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  // Full-size renderers for the main (wide) column.
  const mainSectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.summary}</div>
          <div className="rsp-exp-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.experience}</div>
          {data.experience.map((exp, i) => (
            <div className="rsp-exp-item" key={i}>
              <div className="rsp-exp-header">
                <div className="rsp-exp-title">{exp.title || 'Job Title'}</div>
                <div className="rsp-exp-date">
                  {exp.start}
                  {(exp.start || exp.end) ? ' – ' : ''}
                  {exp.end || 'Present'}
                </div>
              </div>
              <div className="rsp-exp-company">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              {exp.description && (
                <div className="rsp-exp-desc">
                  <Description text={exp.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.projects}</div>
          {data.projects.map((pr, i) => (
            <div className="rsp-exp-item" key={i}>
              <div className="rsp-exp-header">
                <div className="rsp-exp-title">{pr.name || 'Project'}</div>
                {pr.url && (
                  <div className="rsp-exp-date" style={{ color: '#2563eb' }}>
                    {pr.url}
                  </div>
                )}
              </div>
              {pr.tech && <div className="rsp-exp-company">{pr.tech}</div>}
              {pr.description && (
                <div className="rsp-exp-desc">
                  <Description text={pr.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.awards}</div>
          {data.awards.map((award, i) => (
            <div className="rsp-exp-item" key={i}>
              <div className="rsp-exp-header">
                <div className="rsp-exp-title">{award.title || 'Award'}</div>
                <div className="rsp-exp-date">{award.year}</div>
              </div>
              <div className="rsp-exp-company">{award.issuer}</div>
              {award.description && (
                <div className="rsp-exp-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.education}</div>
          {data.education.map((edu, i) => (
            <div className="rsp-exp-item" key={i}>
              <div className="rsp-exp-header">
                <div className="rsp-exp-title">{edu.degree || 'Degree'}</div>
                <div className="rsp-exp-date">
                  {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
                </div>
              </div>
              <div className="rsp-exp-company">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
              {edu.description && <div className="rsp-exp-desc">{edu.description}</div>}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      data.skills.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.skills}</div>
          <div className="rsp-skills">
            {data.skills.map((s, i) => (
              <span className="rsp-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.certifications}</div>
          {data.certifications.map((c, i) => (
            <div className="rsp-exp-item" key={i}>
              <div className="rsp-exp-header">
                <div className="rsp-exp-title">{c.name || 'Certification'}</div>
                <div className="rsp-exp-date">{c.year}</div>
              </div>
              <div className="rsp-exp-company">{c.org}</div>
            </div>
          ))}
        </div>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">{SECTION_LABELS.languages}</div>
          <div className="rsp-skills">
            {data.languages.map((l, i) => (
              <span className="rsp-skill" key={i}>
                {l.lang}
                {l.level ? ` · ${l.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null,
  };

  // Compact renderers for the narrow side column — smaller headings and
  // dates stacked under the title instead of right-aligned, but still real
  // bullet lists (see .rtc-side-* in global.css). Any section can land
  // here via `data.sectionColumns`, so every section has one.
  const sideSectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.summary}</div>
          <div className="rsp-exp-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.experience}</div>
          {data.experience.map((exp, i) => (
            <div className="rtc-side-item" key={i}>
              <div className="rtc-side-item-title">{exp.title || 'Job Title'}</div>
              <div className="rtc-side-item-sub">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              <div className="rtc-side-item-date">
                {exp.start}
                {(exp.start || exp.end) ? ' – ' : ''}
                {exp.end || 'Present'}
              </div>
              {exp.description && (
                <div className="rtc-side-desc">
                  <Description text={exp.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.projects}</div>
          {data.projects.map((pr, i) => (
            <div className="rtc-side-item" key={i}>
              <div className="rtc-side-item-title">{pr.name || 'Project'}</div>
              {pr.tech && <div className="rtc-side-item-sub">{pr.tech}</div>}
              {pr.url && <div className="rtc-side-item-date">{pr.url}</div>}
              {pr.description && (
                <div className="rtc-side-desc">
                  <Description text={pr.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.awards}</div>
          {data.awards.map((award, i) => (
            <div className="rtc-side-item" key={i}>
              <div className="rtc-side-item-title">{award.title || 'Award'}</div>
              <div className="rtc-side-item-sub">{award.issuer}</div>
              <div className="rtc-side-item-date">{award.year}</div>
              {award.description && (
                <div className="rtc-side-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.education}</div>
          {data.education.map((edu, i) => (
            <div className="rtc-side-item" key={i}>
              <div className="rtc-side-item-title">{edu.degree || 'Degree'}</div>
              <div className="rtc-side-item-sub">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
              <div className="rtc-side-item-date">
                {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
              </div>
              {edu.description && <div className="rtc-side-desc">{edu.description}</div>}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      data.skills.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.skills}</div>
          <div className="rsp-skills">
            {data.skills.map((s, i) => (
              <span className="rsp-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.certifications}</div>
          {data.certifications.map((c, i) => (
            <div className="rsp-cert-item" key={i}>
              <div className="rsp-cert-name">{c.name || 'Certification'}</div>
              <div className="rsp-cert-org">{c.org}</div>
              <div className="rsp-cert-year">{c.year}</div>
            </div>
          ))}
        </div>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">{SECTION_LABELS.languages}</div>
          <div className="rsp-skills">
            {data.languages.map((l, i) => (
              <span className="rsp-skill" key={i}>
                {l.lang}
                {l.level ? ` · ${l.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null,
  };

  function renderCustomMain(key: string) {
    const customId = key.slice(7);
    const custom = customMap.get(customId);
    if (!custom) return null;
    const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
    if (!hasContent) return null;
    return (
      <div className="rsp-section" key={key}>
        {custom.title && <div className="rsp-section-title">{custom.title}</div>}
        {custom.items.map((item, i) => (
          <div className="rsp-exp-item" key={i}>
            <div className="rsp-exp-header">
              <div className="rsp-exp-title">{item.heading}</div>
              {item.date && <div className="rsp-exp-date">{item.date}</div>}
            </div>
            {item.subheading && <div className="rsp-exp-company">{item.subheading}</div>}
            {item.description && (
              <div className="rsp-exp-desc">
                <Description text={item.description} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderCustomSide(key: string) {
    const customId = key.slice(7);
    const custom = customMap.get(customId);
    if (!custom) return null;
    const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
    if (!hasContent) return null;
    return (
      <div className="rsp-sidebar-section" key={key}>
        {custom.title && <div className="rsp-sidebar-title">{custom.title}</div>}
        {custom.items.map((item, i) => (
          <div className="rtc-side-item" key={i}>
            {item.heading && <div className="rtc-side-item-title">{item.heading}</div>}
            {item.subheading && <div className="rtc-side-item-sub">{item.subheading}</div>}
            {item.date && <div className="rtc-side-item-date">{item.date}</div>}
            {item.description && (
              <div className="rtc-side-desc">
                <Description text={item.description} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="resume-split" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      {/* Full-width header: name, title, and contact line. */}
      <div className="rsp-header">
        <div className="rsp-head-text">
          <div className="rsp-name">{p.name || 'Your Name'}</div>
          <div className="rsp-title">{p.title || 'Professional Title'}</div>
          {(p.email || p.phone || p.location) && (
            <div className="rsp-contact-line">
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
              {p.linkedin && <span>{p.linkedin}</span>}
              {p.portfolio && <span>{p.portfolio}</span>}
            </div>
          )}
        </div>
        {p.photo && <img className="rsp-photo" src={p.photo} alt="" />}
      </div>

      {/* Main content column: rendered before sidebar in DOM. */}
      <div className="rsp-main">
        {mainSections.map((key) =>
          key.startsWith('custom:') ? renderCustomMain(key) : mainSectionRenderers[key]?.()
        )}
      </div>

      {/* Sidebar column: ordered sidebar sections (rendered after main in DOM). */}
      <aside className="rsp-sidebar">
        {sidebarSections.map((key) =>
          key.startsWith('custom:') ? renderCustomSide(key) : sideSectionRenderers[key]?.()
        )}
      </aside>
    </div>
  );
}
