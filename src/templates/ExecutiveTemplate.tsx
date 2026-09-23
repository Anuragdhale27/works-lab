import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveSectionOrder } from '../lib/sectionOrder';

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  const order = resolveSectionOrder(data);
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Professional Summary</div>
          <hr className="rexe-divider" />
          <div className="rexe-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Work Experience</div>
          <hr className="rexe-divider" />
          {data.experience.map((exp, i) => (
            <div className="rexe-item" key={i}>
              <div className="rexe-item-header">
                <div className="rexe-exp-title">{exp.title || 'Job Title'}</div>
                <div className="rexe-item-date">
                  {exp.start} – {exp.end || 'Present'}
                </div>
              </div>
              <div className="rexe-exp-sub">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              <div className="rexe-desc">
                <Description text={exp.description} />
              </div>
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      data.skills.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Skills</div>
          <hr className="rexe-divider" />
          <div className="rexe-skills">
            {data.skills.map((s, i) => (
              <span className="rexe-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Education</div>
          <hr className="rexe-divider" />
          {data.education.map((edu, i) => (
            <div className="rexe-item" key={i}>
              <div className="rexe-exp-title">{edu.degree || 'Degree'}</div>
              <div className="rexe-exp-sub">
                {edu.institution} {edu.end ? `· ${edu.end}` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Projects</div>
          <hr className="rexe-divider" />
          {data.projects.map((pr, i) => (
            <div className="rexe-item" key={i}>
              <div className="rexe-exp-title">{pr.name || 'Project'}</div>
              {pr.tech && <div className="rexe-exp-sub">{pr.tech}</div>}
              <div className="rexe-desc">
                <Description text={pr.description} />
              </div>
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Certifications</div>
          <hr className="rexe-divider" />
          {data.certifications.map((c, i) => (
            <div className="rexe-item-header" key={i} style={{ marginBottom: 'var(--r-sp-1)' }}>
              <div className="rexe-exp-title">{c.name}</div>
              <div className="rexe-item-date">
                {c.org}
                {c.year ? ` · ${c.year}` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Languages</div>
          <hr className="rexe-divider" />
          <div className="rexe-desc">
            {data.languages.map((l) => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join('  ·  ')}
          </div>
        </div>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <div className="rexe-section">
          <div className="rexe-section-title">Awards & Achievements</div>
          <hr className="rexe-divider" />
          {data.awards.map((award, i) => (
            <div className="rexe-item" key={i}>
              <div className="rexe-exp-title">{award.title || 'Award'}</div>
              <div className="rexe-exp-sub">
                {award.issuer}
                {award.year ? ` · ${award.year}` : ''}
              </div>
              {award.description && (
                <div className="rexe-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  return (
    <div className="resume-executive" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      <div className="rexe-header">
        <div className="rexe-head-text">
          <div className="rexe-name">{p.name || 'Your Name'}</div>
          <div className="rexe-title">{p.title || 'Professional Title'}</div>
          <div className="rexe-contact">{contactParts.join('  ·  ')}</div>
        </div>
        {p.photo && <img className="rexe-photo" src={p.photo} alt="" />}
      </div>
      <div className="rexe-body">
        {order.map((key) => {
          if (key.startsWith('custom:')) {
            const customId = key.slice(7);
            const custom = customMap.get(customId);
            if (!custom) return null;
            const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
            if (!hasContent) return null;
            return (
              <div className="rexe-section" key={key}>
                {custom.title && <div className="rexe-section-title">{custom.title}</div>}
                {custom.title && <hr className="rexe-divider" />}
                {custom.items.map((item, i) => (
                  <div className="rexe-item" key={i}>
                    {item.heading && <div className="rexe-exp-title">{item.heading}</div>}
                    {item.subheading && (
                      <div className="rexe-exp-sub">
                        {item.subheading}
                        {item.date ? ` · ${item.date}` : ''}
                      </div>
                    )}
                    {item.description && (
                      <div className="rexe-desc">
                        <Description text={item.description} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }
          return sectionRenderers[key as keyof typeof sectionRenderers]?.();
        })}
      </div>
    </div>
  );
}
