import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveSectionOrder } from '../lib/sectionOrder';

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  const order = resolveSectionOrder(data);
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <>
          <div className="rcls-section-title">Professional Summary</div>
          <div className="rcls-desc" style={{ marginBottom: 'var(--r-sp-3)' }}>
            <Description text={data.summary} />
          </div>
        </>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <>
          <div className="rcls-section-title">Work Experience</div>
          {data.experience.map((exp, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{exp.title || 'Job Title'}, {exp.company || 'Company'}</div>
                <div className="rcls-exp-date">{exp.start} – {exp.end || 'Present'}</div>
              </div>
              <div className="rcls-exp-sub">{exp.location}</div>
              <div className="rcls-desc">
                <Description text={exp.description} />
              </div>
            </div>
          ))}
        </>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <>
          <div className="rcls-section-title">Education</div>
          {data.education.map((edu, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{edu.degree || 'Degree'}</div>
                <div className="rcls-exp-date">{edu.start} – {edu.end}</div>
              </div>
              <div className="rcls-exp-sub">
                {edu.institution}
                {edu.location ? `, ${edu.location}` : ''}
              </div>
            </div>
          ))}
        </>
      ) : null,

    skills: () =>
      data.skills.length > 0 ? (
        <>
          <div className="rcls-section-title">Skills</div>
          <div className="rcls-skills-list">{data.skills.join(' · ')}</div>
        </>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <>
          <div className="rcls-section-title">Projects</div>
          {data.projects.map((pr, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-title">{pr.name || 'Project'}</div>
              <div className="rcls-exp-sub">{pr.tech}</div>
              <div className="rcls-desc">
                <Description text={pr.description} />
              </div>
            </div>
          ))}
        </>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <>
          <div className="rcls-section-title">Certifications</div>
          {data.certifications.map((c, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{c.name}</div>
                <div className="rcls-exp-date">{c.year}</div>
              </div>
              <div className="rcls-exp-sub">{c.org}</div>
            </div>
          ))}
        </>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <>
          <div className="rcls-section-title">Languages</div>
          <div className="rcls-skills-list">
            {data.languages.map((l) => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ')}
          </div>
        </>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <>
          <div className="rcls-section-title">Awards & Achievements</div>
          {data.awards.map((award, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{award.title || 'Award'}</div>
                <div className="rcls-exp-date">{award.year}</div>
              </div>
              <div className="rcls-exp-sub">{award.issuer}</div>
              {award.description && (
                <div className="rcls-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </>
      ) : null,
  };

  return (
    <div className="resume-classic" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      <div className="rcls-name">{p.name || 'Your Name'}</div>
      <div className="rcls-title">{p.title || 'Professional Title'}</div>
      <div className="rcls-contact">{contactParts.join('  |  ')}</div>
      <hr className="rcls-divider" />

      {order.map((key) => {
        if (key.startsWith('custom:')) {
          const customId = key.slice(7);
          const custom = customMap.get(customId);
          if (!custom) return null;
          const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
          if (!hasContent) return null;
          return (
            <div key={key}>
              {custom.title && <div className="rcls-section-title">{custom.title}</div>}
              {custom.items.map((item, i) => (
                <div className="rcls-exp-item" key={i}>
                  {item.heading && (
                    <div className="rcls-exp-header">
                      <div className="rcls-exp-title">{item.heading}</div>
                      {item.date && <div className="rcls-exp-date">{item.date}</div>}
                    </div>
                  )}
                  {item.subheading && <div className="rcls-exp-sub">{item.subheading}</div>}
                  {item.description && (
                    <div className="rcls-desc">
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
  );
}
