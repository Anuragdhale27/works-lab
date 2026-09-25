import type { ResumeData, TemplateKey } from '../../types/resume';
import { resolveSectionOrder } from '../../lib/sectionOrder';

interface SectionOrderPanelProps {
  data: ResumeData;
  template: TemplateKey;
  onMoveSection: (sectionKey: string, direction: 'up' | 'down') => void;
  onResetOrder: () => void;
}

function labelAndEmptyState(sectionKey: string, data: ResumeData): { label: string; isEmpty: boolean } {
  switch (sectionKey) {
    case 'summary':
      return { label: 'Professional Summary', isEmpty: !data.summary.trim() };
    case 'experience':
      return { label: 'Work Experience', isEmpty: data.experience.length === 0 };
    case 'education':
      return { label: 'Education', isEmpty: data.education.length === 0 };
    case 'skills':
      return { label: 'Skills', isEmpty: data.skills.length === 0 };
    case 'projects':
      return { label: 'Projects', isEmpty: data.projects.length === 0 };
    case 'certifications':
      return { label: 'Certifications', isEmpty: data.certifications.length === 0 };
    case 'languages':
      return { label: 'Languages', isEmpty: data.languages.length === 0 };
    case 'awards':
      return { label: 'Awards & Achievements', isEmpty: data.awards.length === 0 };
    default: {
      if (sectionKey.startsWith('custom:')) {
        const customId = sectionKey.slice(7);
        const customSec = data.customSections.find((c) => c.id === customId);
        return {
          label: customSec?.title || 'Untitled section',
          isEmpty: !customSec || (customSec.items.length === 0 && !customSec.title.trim()),
        };
      }
      return { label: '', isEmpty: false };
    }
  }
}

export function SectionOrderPanel({ data, template, onMoveSection, onResetOrder }: SectionOrderPanelProps) {
  const order = resolveSectionOrder(data);

  return (
    <div className="section-order-panel">
      {(template === 'sidebar' || template === 'split') && (
        <p className="section-order-hint">In two-column templates, sections move within their own column.</p>
      )}
      <div className="section-order-list">
        {order.map((sectionKey, idx, arr) => {
          const { label, isEmpty } = labelAndEmptyState(sectionKey, data);
          return (
            <div className="section-order-row" key={sectionKey}>
              <span className={isEmpty ? 'section-order-label is-empty' : 'section-order-label'}>
                {label} {isEmpty && <span className="section-order-empty-tag">(empty)</span>}
              </span>
              <div className="section-order-actions">
                <button
                  className="btn-move"
                  onClick={() => onMoveSection(sectionKey, 'up')}
                  disabled={idx === 0}
                  aria-label={`Move ${label} up`}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  className="btn-move"
                  onClick={() => onMoveSection(sectionKey, 'down')}
                  disabled={idx === arr.length - 1}
                  aria-label={`Move ${label} down`}
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-outline btn-sm" onClick={onResetOrder}>
        Reset to default order
      </button>
    </div>
  );
}
