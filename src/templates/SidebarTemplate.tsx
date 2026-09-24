import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveSectionOrder } from '../lib/sectionOrder';

const SIDEBAR_SECTIONS = new Set<string>(['skills', 'languages', 'certifications']);

export function SidebarTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const order = resolveSectionOrder(data);
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  // Split sections into main and sidebar
  const mainSections = order.filter((k) => {
    if (k.startsWith('custom:')) return true;
    return !SIDEBAR_SECTIONS.has(k);
  });
  const sidebarSections = order.filter((k) => {
    if (k.startsWith('custom:')) return false;
    return SIDEBAR_SECTIONS.has(k);
  });

  const mainSectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <div className="rsb-section">
          <div className="rsb-section-title">Professional Summary</div>
          <div className="rsb-exp-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rsb-section">
          <div className="rsb-section-title">Work Experience</div>
          {data.experience.map((exp, i) => (
            <div className="rsb-exp-item" key={i}>
              <div className="rsb-exp-header">
                <div className="rsb-exp-title">{exp.title || 'Job Title'}</div>
                <div className="rsb-exp-date">
                  {exp.start}
                  {(exp.start || exp.end) ? ' – ' : ''}
                  {exp.end || 'Present'}
                </div>
              </div>
              <div className="rsb-exp-company">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              {exp.description && (
                <div className="rsb-exp-desc">
                  <Description text={exp.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <div className="rsb-section">
          <div className="rsb-section-title">Projects</div>
          {data.projects.map((pr, i) => (
            <div className="rsb-exp-item" key={i}>
              <div className="rsb-exp-header">
                <div className="rsb-exp-title">{pr.name || 'Project'}</div>
                {pr.url && (
                  <div className="rsb-exp-date" style={{ color: '#2563eb' }}>
                    {pr.url}
                  </div>
                )}
              </div>
              {pr.tech && <div className="rsb-exp-company">{pr.tech}</div>}
              {pr.description && (
                <div className="rsb-exp-desc">
                  <Description text={pr.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <div className="rsb-section">
          <div className="rsb-section-title">Awards & Achievements</div>
          {data.awards.map((award, i) => (
            <div className="rsb-exp-item" key={i}>
              <div className="rsb-exp-header">
                <div className="rsb-exp-title">{award.title || 'Award'}</div>
                <div className="rsb-exp-date">{award.year}</div>
              </div>
              <div className="rsb-exp-company">{award.issuer}</div>
              {award.description && (
                <div className="rsb-exp-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rsb-section">
          <div className="rsb-section-title">Education</div>
          {data.education.map((edu, i) => (
            <div className="rsb-edu-item" key={i}>
              <div className="rsb-edu-degree">{edu.degree || 'Degree'}</div>
              <div className="rsb-edu-school">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
              <div className="rsb-edu-year">
                {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
                {edu.description ? ` · ${edu.description}` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : null,
  };

  const sidebarSectionRenderers: Record<string, () => React.ReactNode> = {
    skills: () =>
      data.skills.length > 0 ? (
        <div className="rsb-sidebar-section">
          <div className="rsb-sidebar-title">Skills</div>
          <div className="rsb-skills">
            {data.skills.map((s, i) => (
              <span className="rsb-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <div className="rsb-sidebar-section">
          <div className="rsb-sidebar-title">Languages</div>
          <div className="rsb-skills">
            {data.languages.map((l, i) => (
              <span className="rsb-skill" key={i}>
                {l.lang}
                {l.level ? ` · ${l.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rsb-sidebar-section">
          <div className="rsb-sidebar-title">Certifications</div>
          {data.certifications.map((c, i) => (
            <div className="rsb-cert-item" key={i}>
              <div className="rsb-cert-name">{c.name || 'Certification'}</div>
              <div className="rsb-cert-org">{c.org}</div>
              <div className="rsb-cert-year">{c.year}</div>
            </div>
          ))}
        </div>
      ) : null,
  };

  return (
    <div className="resume-sidebar" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      {/* Header section: name, title, summary. Rendered first in DOM for reading order. */}
      <div className="rsb-header">
        <div className="rsb-head-text">
          <div className="rsb-name">{p.name || 'Your Name'}</div>
          <div className="rsb-title">{p.title || 'Professional Title'}</div>
        </div>
        {p.photo && <img className="rsb-photo" src={p.photo} alt="" />}
      </div>

      {/* Main content column: rendered before sidebar in DOM. */}
      <div className="rsb-main">
        {mainSections.map((key) => {
          if (key.startsWith('custom:')) {
            const customId = key.slice(7);
            const custom = customMap.get(customId);
            if (!custom) return null;
            const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
            if (!hasContent) return null;
            return (
              <div className="rsb-section" key={key}>
                {custom.title && <div className="rsb-section-title">{custom.title}</div>}
                {custom.items.map((item, i) => (
                  <div className="rsb-exp-item" key={i}>
                    <div className="rsb-exp-header">
                      <div className="rsb-exp-title">{item.heading}</div>
                      {item.date && <div className="rsb-exp-date">{item.date}</div>}
                    </div>
                    {item.subheading && <div className="rsb-exp-company">{item.subheading}</div>}
                    {item.description && (
                      <div className="rsb-exp-desc">
                        <Description text={item.description} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }
          return mainSectionRenderers[key as keyof typeof mainSectionRenderers]?.();
        })}
      </div>

      {/* Sidebar column: contact (always first, fixed) then ordered sidebar sections (rendered after main in DOM). */}
      <aside className="rsb-sidebar">
        {/* Contact section (always first) */}
        <div className="rsb-sidebar-section">
          <div className="rsb-sidebar-title">Contact</div>
          <div className="rsb-contact">
            {p.email && (
              <div className="rsb-contact-item">
                <strong>Email</strong>
                {p.email}
              </div>
            )}
            {p.phone && (
              <div className="rsb-contact-item">
                <strong>Phone</strong>
                {p.phone}
              </div>
            )}
            {p.location && (
              <div className="rsb-contact-item">
                <strong>Location</strong>
                {p.location}
              </div>
            )}
            {p.linkedin && (
              <div className="rsb-contact-item">
                <strong>LinkedIn</strong>
                {p.linkedin}
              </div>
            )}
            {p.portfolio && (
              <div className="rsb-contact-item">
                <strong>Portfolio</strong>
                {p.portfolio}
              </div>
            )}
          </div>
        </div>

        {sidebarSections.map((key) => {
          if (key.startsWith('custom:')) {
            const customId = key.slice(7);
            const custom = customMap.get(customId);
            if (!custom) return null;
            const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
            if (!hasContent) return null;
            return (
              <div className="rsb-sidebar-section" key={key}>
                {custom.title && <div className="rsb-sidebar-title">{custom.title}</div>}
                {custom.items.map((item, i) => (
                  <div className="rsb-cert-item" key={i}>
                    {item.heading && <div className="rsb-cert-name">{item.heading}</div>}
                    {item.subheading && <div className="rsb-cert-org">{item.subheading}</div>}
                    {item.date && <div className="rsb-cert-year">{item.date}</div>}
                  </div>
                ))}
              </div>
            );
          }
          return sidebarSectionRenderers[key as keyof typeof sidebarSectionRenderers]?.();
        })}
      </aside>
    </div>
  );
}
