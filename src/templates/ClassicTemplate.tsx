import type { ResumeData } from '../types/resume';
import { Description } from './Description';

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  return (
    <div className="resume-classic">
      <div className="rcls-name">{p.name || 'Your Name'}</div>
      <div className="rcls-title">{p.title || 'Professional Title'}</div>
      <div className="rcls-contact">{contactParts.join('  |  ')}</div>
      <hr className="rcls-divider" />

      {data.summary && (
        <>
          <div className="rcls-section-title">Professional Summary</div>
          <div className="rcls-desc" style={{ marginBottom: 'var(--r-sp-3)' }}><Description text={data.summary} /></div>
        </>
      )}

      {data.experience.length > 0 && (
        <>
          <div className="rcls-section-title">Work Experience</div>
          {data.experience.map((exp, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{exp.title || 'Job Title'}, {exp.company || 'Company'}</div>
                <div className="rcls-exp-date">{exp.start} – {exp.end || 'Present'}</div>
              </div>
              <div className="rcls-exp-sub">{exp.location}</div>
              <div className="rcls-desc"><Description text={exp.description} /></div>
            </div>
          ))}
        </>
      )}

      {data.education.length > 0 && (
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
      )}

      {data.skills.length > 0 && (
        <>
          <div className="rcls-section-title">Skills</div>
          <div className="rcls-skills-list">{data.skills.join(' · ')}</div>
        </>
      )}

      {data.projects.length > 0 && (
        <>
          <div className="rcls-section-title">Projects</div>
          {data.projects.map((pr, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-title">{pr.name || 'Project'}</div>
              <div className="rcls-exp-sub">{pr.tech}</div>
              <div className="rcls-desc"><Description text={pr.description} /></div>
            </div>
          ))}
        </>
      )}

      {data.certifications.length > 0 && (
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
      )}

      {data.languages.length > 0 && (
        <>
          <div className="rcls-section-title">Languages</div>
          <div className="rcls-skills-list">
            {data.languages.map((l) => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ')}
          </div>
        </>
      )}

      {data.awards.length > 0 && (
        <>
          <div className="rcls-section-title">Awards & Achievements</div>
          {data.awards.map((award, i) => (
            <div className="rcls-exp-item" key={i}>
              <div className="rcls-exp-header">
                <div className="rcls-exp-title">{award.title || 'Award'}</div>
                <div className="rcls-exp-date">{award.year}</div>
              </div>
              <div className="rcls-exp-sub">{award.issuer}</div>
              {award.description && <div className="rcls-desc"><Description text={award.description} /></div>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
