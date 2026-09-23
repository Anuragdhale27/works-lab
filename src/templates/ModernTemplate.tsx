import type { ResumeData } from '../types/resume';
import { Description } from './Description';
import { resolveSectionOrder } from '../lib/sectionOrder';

export function ModernTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const order = resolveSectionOrder(data);
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      data.summary ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Professional Summary</div>
          <div className="rmod-exp-desc">
            <Description text={data.summary} />
          </div>
        </div>
      ) : null,

    experience: () =>
      data.experience.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Work Experience</div>
          {data.experience.map((exp, i) => (
            <div className="rmod-exp-item" key={i}>
              <div className="rmod-exp-header">
                <div className="rmod-exp-title">{exp.title || 'Job Title'}</div>
                <div className="rmod-exp-date">
                  {exp.start}
                  {(exp.start || exp.end) ? ' – ' : ''}
                  {exp.end || 'Present'}
                </div>
              </div>
              <div className="rmod-exp-company">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              {exp.description && (
                <div className="rmod-exp-desc">
                  <Description text={exp.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      data.education.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Education</div>
          {data.education.map((edu, i) => (
            <div className="rmod-edu-item" key={i}>
              <div className="rmod-edu-degree">{edu.degree || 'Degree'}</div>
              <div className="rmod-edu-school">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
              <div className="rmod-edu-year">
                {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
                {edu.description ? ` · ${edu.description}` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      data.skills.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Skills</div>
          <div className="rmod-skills">
            {data.skills.map((s, i) => (
              <span className="rmod-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    projects: () =>
      data.projects.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Projects</div>
          {data.projects.map((pr, i) => (
            <div className="rmod-exp-item" key={i}>
              <div className="rmod-exp-header">
                <div className="rmod-exp-title">{pr.name || 'Project'}</div>
                {pr.url && <div className="rmod-exp-date" style={{ color: '#2563eb' }}>{pr.url}</div>}
              </div>
              {pr.tech && <div className="rmod-exp-company">{pr.tech}</div>}
              {pr.description && (
                <div className="rmod-exp-desc">
                  <Description text={pr.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      data.certifications.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Certifications</div>
          {data.certifications.map((c, i) => (
            <div className="rmod-exp-item" key={i}>
              <div className="rmod-exp-header">
                <div className="rmod-exp-title">{c.name || 'Certification'}</div>
                <div className="rmod-exp-date">{c.year}</div>
              </div>
              <div className="rmod-exp-company">{c.org}</div>
            </div>
          ))}
        </div>
      ) : null,

    languages: () =>
      data.languages.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Languages</div>
          <div className="rmod-skills">
            {data.languages.map((l, i) => (
              <span className="rmod-skill" key={i}>
                {l.lang}
                {l.level ? ` · ${l.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    awards: () =>
      data.awards.length > 0 ? (
        <div className="rmod-section">
          <div className="rmod-section-title">Awards & Achievements</div>
          {data.awards.map((award, i) => (
            <div className="rmod-exp-item" key={i}>
              <div className="rmod-exp-header">
                <div className="rmod-exp-title">{award.title || 'Award'}</div>
                <div className="rmod-exp-date">{award.year}</div>
              </div>
              <div className="rmod-exp-company">{award.issuer}</div>
              {award.description && (
                <div className="rmod-exp-desc">
                  <Description text={award.description} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  return (
    <div className="resume-modern" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      <div className="rmod-header">
        <div className="rmod-head-text">
          <div className="rmod-name">{p.name || 'Your Name'}</div>
          <div className="rmod-title">{p.title || 'Professional Title'}</div>
          <div className="rmod-contact">
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.location && <span>📍 {p.location}</span>}
            {p.linkedin && <span>🔗 {p.linkedin}</span>}
            {p.portfolio && <span>🌐 {p.portfolio}</span>}
          </div>
        </div>
        {p.photo && <img className="rmod-photo" src={p.photo} alt="" />}
      </div>
      <div className="rmod-body">
        {order.map((key) => {
          if (key.startsWith('custom:')) {
            const customId = key.slice(7);
            const custom = customMap.get(customId);
            if (!custom) return null;
            const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
            if (!hasContent) return null;
            return (
              <div className="rmod-section" key={key}>
                {custom.title && <div className="rmod-section-title">{custom.title}</div>}
                {custom.items.map((item, i) => (
                  <div className="rmod-exp-item" key={i}>
                    <div className="rmod-exp-header">
                      <div className="rmod-exp-title">{item.heading}</div>
                      {item.date && <div className="rmod-exp-date">{item.date}</div>}
                    </div>
                    {item.subheading && <div className="rmod-exp-company">{item.subheading}</div>}
                    {item.description && (
                      <div className="rmod-exp-desc">
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
