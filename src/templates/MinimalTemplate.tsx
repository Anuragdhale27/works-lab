import type { ResumeData } from '../types/resume';
import { multiline } from '../lib/multiline';

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const initials = (p.name || 'YN')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="resume-minimal">
      <div className="rmin-sidebar">
        {p.photo ? <img className="rmin-photo" src={p.photo} alt="" /> : <div className="rmin-avatar">{initials}</div>}
        <div className="rmin-name">{p.name || 'Your Name'}</div>
        <div className="rmin-title">{p.title || 'Professional Title'}</div>

        <div className="rmin-label">Contact</div>
        {p.email && <div className="rmin-detail">✉ {p.email}</div>}
        {p.phone && <div className="rmin-detail">📞 {p.phone}</div>}
        {p.location && <div className="rmin-detail">📍 {p.location}</div>}
        {p.linkedin && <div className="rmin-detail">🔗 {p.linkedin}</div>}

        {data.skills.length > 0 && (
          <>
            <div className="rmin-label">Skills</div>
            {data.skills.map((s, i) => (
              <div key={i}>
                <div className="rmin-skill-name">{s}</div>
                <div className="rmin-skill-bar">
                  <div className="rmin-skill-fill" style={{ width: '80%' }} />
                </div>
              </div>
            ))}
          </>
        )}

        {data.languages.length > 0 && (
          <>
            <div className="rmin-label">Languages</div>
            {data.languages.map((l, i) => (
              <div className="rmin-detail" key={i}>
                {l.lang}
                {l.level ? ` · ${l.level}` : ''}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="rmin-main">
        {data.summary && (
          <>
            <div className="rmin-section-title">Summary</div>
            <div className="rmin-desc">{multiline(data.summary)}</div>
          </>
        )}

        {data.experience.length > 0 && (
          <>
            <div className="rmin-section-title">Experience</div>
            {data.experience.map((exp, i) => (
              <div style={{ marginBottom: '12px' }} key={i}>
                <div className="rmin-exp-title">{exp.title || 'Job Title'}</div>
                <div className="rmin-exp-sub">
                  {exp.company} {exp.location ? `· ${exp.location}` : ''}{' '}
                  {exp.start ? `· ${exp.start} – ${exp.end || 'Present'}` : ''}
                </div>
                <div className="rmin-desc">{multiline(exp.description)}</div>
              </div>
            ))}
          </>
        )}

        {data.education.length > 0 && (
          <>
            <div className="rmin-section-title">Education</div>
            {data.education.map((edu, i) => (
              <div style={{ marginBottom: '10px' }} key={i}>
                <div className="rmin-exp-title">{edu.degree || 'Degree'}</div>
                <div className="rmin-exp-sub">
                  {edu.institution} {edu.start ? `· ${edu.start} – ${edu.end || ''}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {data.projects.length > 0 && (
          <>
            <div className="rmin-section-title">Projects</div>
            {data.projects.map((pr, i) => (
              <div style={{ marginBottom: '10px' }} key={i}>
                <div className="rmin-exp-title">{pr.name || 'Project'}</div>
                {pr.tech && <div className="rmin-exp-sub">{pr.tech}</div>}
                <div className="rmin-desc">{multiline(pr.description)}</div>
              </div>
            ))}
          </>
        )}

        {data.certifications.length > 0 && (
          <>
            <div className="rmin-section-title">Certifications</div>
            {data.certifications.map((c, i) => (
              <div className="rmin-exp-title" key={i}>
                {c.name}{' '}
                <span style={{ fontWeight: 400, fontSize: '9px', color: '#888' }}>
                  {c.org} {c.year}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
