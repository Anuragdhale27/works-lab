import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveSectionOrder } from '../lib/sectionOrder';

const SIDEBAR_SECTIONS = new Set<string>(['skills', 'education', 'certifications', 'languages']);

export function SplitTemplate({ data }: { data: ResumeData }) {
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
        <div className="rsp-section">
          <div className="rsp-section-title">Professional Summary</div>
          <div className="rsp-exp-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rsp-section">
          <div className="rsp-section-title">Work Experience</div>
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
          <div className="rsp-section-title">Projects</div>
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
          <div className="rsp-section-title">Awards & Achievements</div>
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
  };

  const sidebarSectionRenderers: Record<string, () => React.ReactNode> = {
    skills: () =>
      data.skills.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">Skills</div>
          <div className="rsp-skills">
            {data.skills.map((s, i) => (
              <span className="rsp-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">Education</div>
          {data.education.map((edu, i) => (
            <div className="rsp-edu-item" key={i}>
              <div className="rsp-edu-degree">{edu.degree || 'Degree'}</div>
              <div className="rsp-edu-school">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
              <div className="rsp-edu-year">
                {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
                {edu.description ? ` · ${edu.description}` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rsp-sidebar-section">
          <div className="rsp-sidebar-title">Certifications</div>
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
          <div className="rsp-sidebar-title">Languages</div>
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
        {mainSections.map((key) => {
          if (key.startsWith('custom:')) {
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
          return mainSectionRenderers[key as keyof typeof mainSectionRenderers]?.();
        })}
      </div>

      {/* Sidebar column: ordered sidebar sections (rendered after main in DOM). */}
      <aside className="rsp-sidebar">
        {sidebarSections.map((key) => {
          if (key.startsWith('custom:')) {
            const customId = key.slice(7);
            const custom = customMap.get(customId);
            if (!custom) return null;
            const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
            if (!hasContent) return null;
            return (
              <div className="rsp-sidebar-section" key={key}>
                {custom.title && <div className="rsp-sidebar-title">{custom.title}</div>}
                {custom.items.map((item, i) => (
                  <div className="rsp-cert-item" key={i}>
                    {item.heading && <div className="rsp-cert-name">{item.heading}</div>}
                    {item.subheading && <div className="rsp-cert-org">{item.subheading}</div>}
                    {item.date && <div className="rsp-cert-year">{item.date}</div>}
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
