import type { ResumeData } from '../types/resume';
import { multiline } from '../lib/multiline';

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  return (
    <div className="resume-executive">
      <div className="rexe-header">
        <div className="rexe-name">{p.name || 'Your Name'}</div>
        <div className="rexe-title">{p.title || 'Professional Title'}</div>
        <div className="rexe-contact">{contactParts.join('  ·  ')}</div>
      </div>
      <div className="rexe-body">
        {data.summary && (
          <div className="rexe-section">
            <div className="rexe-section-title">Professional Summary</div>
            <hr className="rexe-divider" />
            <div className="rexe-desc">{multiline(data.summary)}</div>
          </div>
        )}

        {data.experience.length > 0 && (
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
                <div className="rexe-desc">{multiline(exp.description)}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rexe-section">
            <div className="rexe-section-title">Skills</div>
            <hr className="rexe-divider" />
            <div className="rexe-skills">
              {data.skills.map((s, i) => (
                <span className="rexe-skill" key={i}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
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
        )}

        {data.projects.length > 0 && (
          <div className="rexe-section">
            <div className="rexe-section-title">Projects</div>
            <hr className="rexe-divider" />
            {data.projects.map((pr, i) => (
              <div className="rexe-item" key={i}>
                <div className="rexe-exp-title">{pr.name || 'Project'}</div>
                {pr.tech && <div className="rexe-exp-sub">{pr.tech}</div>}
                <div className="rexe-desc">{multiline(pr.description)}</div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
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
        )}

        {data.languages.length > 0 && (
          <div className="rexe-section">
            <div className="rexe-section-title">Languages</div>
            <hr className="rexe-divider" />
            <div className="rexe-desc">
              {data.languages.map((l) => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join('  ·  ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
