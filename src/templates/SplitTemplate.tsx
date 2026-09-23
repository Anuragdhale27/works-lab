import type { ResumeData } from '../types/resume';
import { Description } from './Description';

export function SplitTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="resume-split">
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

      {/* Main content column: summary, experience, projects (rendered before sidebar in DOM). */}
      <div className="rsp-main">
        {data.summary && (
          <div className="rsp-section">
            <div className="rsp-section-title">Professional Summary</div>
            <div className="rsp-exp-desc">
              <Description text={data.summary} />
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
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
        )}

        {data.projects.length > 0 && (
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
        )}
      </div>

      {/* Sidebar column: skills, education, certifications, languages (rendered after main in DOM). */}
      <aside className="rsp-sidebar">
        {data.skills.length > 0 && (
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
        )}

        {data.education.length > 0 && (
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
        )}

        {data.certifications.length > 0 && (
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
        )}

        {data.languages.length > 0 && (
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
        )}
      </aside>
    </div>
  );
}
