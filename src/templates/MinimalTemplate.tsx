import type { ResumeData } from '../types/resume';
import { Description } from './Description';

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);

  return (
    <div className="resume-minimal" style={data.accent ? { '--r-accent': data.accent } as React.CSSProperties : {}}>
      <div className="rmin-head">
        <div className="rmin-head-text">
          <div className="rmin-name">{p.name || 'Your Name'}</div>
          {p.title && <div className="rmin-title">{p.title}</div>}
          {contactParts.length > 0 && <div className="rmin-contact">{contactParts.join('   ·   ')}</div>}
        </div>
        {p.photo && <img className="rmin-photo" src={p.photo} alt="" />}
      </div>
      <hr className="rmin-divider" />

      {data.summary && (
        <div className="rmin-section">
          <div className="rmin-section-title">Professional Summary</div>
          <div className="rmin-desc"><Description text={data.summary} /></div>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Work Experience</div>
          {data.experience.map((exp, i) => (
            <div className="rmin-item" key={i}>
              <div className="rmin-item-header">
                <div className="rmin-item-title">{exp.title || 'Job Title'}</div>
                <div className="rmin-item-date">
                  {exp.start ? `${exp.start} – ${exp.end || 'Present'}` : ''}
                </div>
              </div>
              <div className="rmin-item-sub">
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ''}
              </div>
              <div className="rmin-desc"><Description text={exp.description} /></div>
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Education</div>
          {data.education.map((edu, i) => (
            <div className="rmin-item" key={i}>
              <div className="rmin-item-header">
                <div className="rmin-item-title">{edu.degree || 'Degree'}</div>
                <div className="rmin-item-date">
                  {edu.start ? `${edu.start} – ${edu.end || ''}` : ''}
                </div>
              </div>
              <div className="rmin-item-sub">
                {edu.institution}
                {edu.location ? ` · ${edu.location}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Skills</div>
          <div className="rmin-desc">{data.skills.join('  ·  ')}</div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Projects</div>
          {data.projects.map((pr, i) => (
            <div className="rmin-item" key={i}>
              <div className="rmin-item-title">{pr.name || 'Project'}</div>
              {pr.tech && <div className="rmin-item-sub">{pr.tech}</div>}
              <div className="rmin-desc"><Description text={pr.description} /></div>
            </div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Certifications</div>
          {data.certifications.map((c, i) => (
            <div className="rmin-item-header" key={i} style={{ marginBottom: 'var(--r-sp-1)' }}>
              <div className="rmin-item-title">{c.name}</div>
              <div className="rmin-item-date">
                {c.org}
                {c.year ? ` · ${c.year}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Languages</div>
          <div className="rmin-desc">
            {data.languages.map((l) => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join('  ·  ')}
          </div>
        </div>
      )}

      {data.awards.length > 0 && (
        <div className="rmin-section">
          <div className="rmin-section-title">Awards & Achievements</div>
          {data.awards.map((award, i) => (
            <div className="rmin-item" key={i}>
              <div className="rmin-item-header">
                <div className="rmin-item-title">{award.title || 'Award'}</div>
                <div className="rmin-item-date">{award.year}</div>
              </div>
              <div className="rmin-item-sub">{award.issuer}</div>
              {award.description && <div className="rmin-desc"><Description text={award.description} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
