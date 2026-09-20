import type { ResumeData } from '../types/resume';
import { multiline } from '../lib/multiline';

export function ModernTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="resume-modern">
      <div className="rmod-header">
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
      <div className="rmod-body">
        {data.summary && (
          <div className="rmod-section">
            <div className="rmod-section-title">Professional Summary</div>
            <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.7 }}>{multiline(data.summary)}</div>
          </div>
        )}

        {data.experience.length > 0 && (
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
                {exp.description && <div className="rmod-exp-desc">{multiline(exp.description)}</div>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
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
        )}

        {data.skills.length > 0 && (
          <div className="rmod-section">
            <div className="rmod-section-title">Skills</div>
            <div className="rmod-skills">
              {data.skills.map((s, i) => (
                <span className="rmod-skill" key={i}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="rmod-section">
            <div className="rmod-section-title">Projects</div>
            {data.projects.map((pr, i) => (
              <div className="rmod-exp-item" key={i}>
                <div className="rmod-exp-header">
                  <div className="rmod-exp-title">{pr.name || 'Project'}</div>
                  {pr.url && <div className="rmod-exp-date" style={{ color: '#2563eb' }}>{pr.url}</div>}
                </div>
                {pr.tech && <div className="rmod-exp-company">{pr.tech}</div>}
                {pr.description && <div className="rmod-exp-desc">{multiline(pr.description)}</div>}
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
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
        )}

        {data.languages.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
