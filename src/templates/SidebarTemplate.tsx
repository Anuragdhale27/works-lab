import type { ResumeData } from '../types/resume';
import { Description } from './Description';

export function SidebarTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="resume-sidebar">
      {/* Header section: name, title, summary. Rendered first in DOM for reading order. */}
      <div className="rsb-header">
        <div className="rsb-head-text">
          <div className="rsb-name">{p.name || 'Your Name'}</div>
          <div className="rsb-title">{p.title || 'Professional Title'}</div>
        </div>
        {p.photo && <img className="rsb-photo" src={p.photo} alt="" />}
      </div>

      {/* Main content column: summary, experience, projects (rendered before sidebar in DOM). */}
      <div className="rsb-main">
        {data.summary && (
          <div className="rsb-section">
            <div className="rsb-section-title">Professional Summary</div>
            <div className="rsb-exp-desc">
              <Description text={data.summary} />
            </div>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="rsb-section">
            <div className="rsb-section-title">Work Experience</div>
            {data.experience.map((exp, i) => (
              <div className="rsb-exp-item" key={i}>
                <div className="rsb-exp-header">
                  <div className="rsb-exp-title">{exp.title || 'Job Title'}</div>
                  <div className="rsb-exp-date">
                    {exp.start}
                    {(exp.start || exp.end) ? ' – ' : ''}
                    {exp.end || 'Present'}
                  </div>
                </div>
                <div className="rsb-exp-company">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description && (
                  <div className="rsb-exp-desc">
                    <Description text={exp.description} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="rsb-section">
            <div className="rsb-section-title">Projects</div>
            {data.projects.map((pr, i) => (
              <div className="rsb-exp-item" key={i}>
                <div className="rsb-exp-header">
                  <div className="rsb-exp-title">{pr.name || 'Project'}</div>
                  {pr.url && (
                    <div className="rsb-exp-date" style={{ color: '#2563eb' }}>
                      {pr.url}
                    </div>
                  )}
                </div>
                {pr.tech && <div className="rsb-exp-company">{pr.tech}</div>}
                {pr.description && (
                  <div className="rsb-exp-desc">
                    <Description text={pr.description} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rsb-section">
            <div className="rsb-section-title">Education</div>
            {data.education.map((edu, i) => (
              <div className="rsb-edu-item" key={i}>
                <div className="rsb-edu-degree">{edu.degree || 'Degree'}</div>
                <div className="rsb-edu-school">
                  {edu.institution}
                  {edu.location ? ` · ${edu.location}` : ''}
                </div>
                <div className="rsb-edu-year">
                  {(edu.start || edu.end) ? `${edu.start || ''} – ${edu.end || 'Present'}` : ''}
                  {edu.description ? ` · ${edu.description}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar column: contact, skills, languages, certifications (rendered after main in DOM). */}
      <aside className="rsb-sidebar">
        {/* Contact section */}
        <div className="rsb-sidebar-section">
          <div className="rsb-sidebar-title">Contact</div>
          <div className="rsb-contact">
            {p.email && (
              <div className="rsb-contact-item">
                <strong>Email</strong>
                <br />
                {p.email}
              </div>
            )}
            {p.phone && (
              <div className="rsb-contact-item">
                <strong>Phone</strong>
                <br />
                {p.phone}
              </div>
            )}
            {p.location && (
              <div className="rsb-contact-item">
                <strong>Location</strong>
                <br />
                {p.location}
              </div>
            )}
            {p.linkedin && (
              <div className="rsb-contact-item">
                <strong>LinkedIn</strong>
                <br />
                {p.linkedin}
              </div>
            )}
            {p.portfolio && (
              <div className="rsb-contact-item">
                <strong>Portfolio</strong>
                <br />
                {p.portfolio}
              </div>
            )}
          </div>
        </div>

        {data.skills.length > 0 && (
          <div className="rsb-sidebar-section">
            <div className="rsb-sidebar-title">Skills</div>
            <div className="rsb-skills">
              {data.skills.map((s, i) => (
                <span className="rsb-skill" key={i}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rsb-sidebar-section">
            <div className="rsb-sidebar-title">Languages</div>
            <div className="rsb-skills">
              {data.languages.map((l, i) => (
                <span className="rsb-skill" key={i}>
                  {l.lang}
                  {l.level ? ` · ${l.level}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rsb-sidebar-section">
            <div className="rsb-sidebar-title">Certifications</div>
            {data.certifications.map((c, i) => (
              <div className="rsb-cert-item" key={i}>
                <div className="rsb-cert-name">{c.name || 'Certification'}</div>
                <div className="rsb-cert-org">{c.org}</div>
                <div className="rsb-cert-year">{c.year}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
