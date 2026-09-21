import type { ResumeData } from '../types/resume';
import { multiline } from '../lib/multiline';

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  return (
    <div className="resume-executive">
      <div className="rexe-header">
        <div>
        <div className="rexe-name">{p.name || 'Your Name'}</div>
        <div className="rexe-title">{p.title || 'Professional Title'}</div>
        <div className="rexe-contact">{contactParts.join('  ·  ')}</div>
        </div>
        {p.photo && <img className="rexe-photo" src={p.photo} alt="" />}
      </div>
      <div className="rexe-body">
        {data.summary && (
          <>
            <div className="rexe-section-title">Executive Profile</div>
            <hr className="rexe-divider" />
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '14px' }}>
              {multiline(data.summary)}
            </div>
          </>
        )}

        {data.experience.length > 0 && (
          <>
            <div className="rexe-section-title">Professional Experience</div>
            <hr className="rexe-divider" />
            {data.experience.map((exp, i) => (
              <div style={{ marginBottom: '14px' }} key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="rexe-exp-title">{exp.title || 'Job Title'}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
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
          </>
        )}

        {data.skills.length > 0 && (
          <>
            <div className="rexe-section-title">Core Competencies</div>
            <hr className="rexe-divider" />
            <div className="rexe-skills" style={{ marginBottom: '16px' }}>
              {data.skills.map((s, i) => (
                <span className="rexe-skill" key={i}>{s}</span>
              ))}
            </div>
          </>
        )}

        {data.education.length > 0 && (
          <>
            <div className="rexe-section-title">Education</div>
            <hr className="rexe-divider" />
            {data.education.map((edu, i) => (
              <div style={{ marginBottom: '10px' }} key={i}>
                <div className="rexe-exp-title">{edu.degree || 'Degree'}</div>
                <div className="rexe-exp-sub">
                  {edu.institution} {edu.end ? `· ${edu.end}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {data.certifications.length > 0 && (
          <>
            <div className="rexe-section-title">Certifications</div>
            <hr className="rexe-divider" />
            {data.certifications.map((c, i) => (
              <div style={{ marginBottom: '6px' }} key={i}>
                <div className="rexe-exp-title">{c.name}</div>
                <div className="rexe-exp-sub">{c.org} {c.year}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
