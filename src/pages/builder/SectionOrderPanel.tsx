import type { ResumeData, TemplateKey } from '../../types/resume';
import { resolveSectionOrder } from '../../lib/sectionOrder';
import { isTwoColumnTemplate, resolveColumns, type Column } from '../../lib/sectionColumns';

interface SectionOrderPanelProps {
  data: ResumeData;
  template: TemplateKey;
  onMoveSection: (sectionKey: string, direction: 'up' | 'down') => void;
  onMoveSectionToColumn: (sectionKey: string, column: Column) => void;
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

function SectionRow({
  sectionKey,
  label,
  isEmpty,
  idx,
  count,
  onMoveUp,
  onMoveDown,
  columnButton,
}: {
  sectionKey: string;
  label: string;
  isEmpty: boolean;
  idx: number;
  count: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  columnButton?: { label: string; onClick: () => void };
}) {
  return (
    <div className="section-order-row" key={sectionKey}>
      <span className={isEmpty ? 'section-order-label is-empty' : 'section-order-label'}>
        {label} {isEmpty && <span className="section-order-empty-tag">(empty)</span>}
      </span>
      <div className="section-order-actions">
        {columnButton && (
          <button className="btn-move btn-move-column" onClick={columnButton.onClick} title={columnButton.label}>
            {columnButton.label}
          </button>
        )}
        <button
          className="btn-move"
          onClick={onMoveUp}
          disabled={idx === 0}
          aria-label={`Move ${label} up`}
          title="Move up"
        >
          ↑
        </button>
        <button
          className="btn-move"
          onClick={onMoveDown}
          disabled={idx === count - 1}
          aria-label={`Move ${label} down`}
          title="Move down"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

export function SectionOrderPanel({ data, template, onMoveSection, onMoveSectionToColumn, onResetOrder }: SectionOrderPanelProps) {
  if (isTwoColumnTemplate(template)) {
    const { main, side } = resolveColumns(data, template);

    return (
      <div className="section-order-panel">
        <div className="section-order-column">
          <h3 className="section-order-column-title">Main column</h3>
          <div className="section-order-list">
            {main.map((sectionKey, idx) => {
              const { label, isEmpty } = labelAndEmptyState(sectionKey, data);
              return (
                <SectionRow
                  key={sectionKey}
                  sectionKey={sectionKey}
                  label={label}
                  isEmpty={isEmpty}
                  idx={idx}
                  count={main.length}
                  onMoveUp={() => onMoveSection(sectionKey, 'up')}
                  onMoveDown={() => onMoveSection(sectionKey, 'down')}
                  columnButton={{
                    label: `Move ${label} to side column →`,
                    onClick: () => onMoveSectionToColumn(sectionKey, 'side'),
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="section-order-column">
          <h3 className="section-order-column-title">Side column</h3>
          <div className="section-order-list">
            {side.map((sectionKey, idx) => {
              const { label, isEmpty } = labelAndEmptyState(sectionKey, data);
              return (
                <SectionRow
                  key={sectionKey}
                  sectionKey={sectionKey}
                  label={label}
                  isEmpty={isEmpty}
                  idx={idx}
                  count={side.length}
                  onMoveUp={() => onMoveSection(sectionKey, 'up')}
                  onMoveDown={() => onMoveSection(sectionKey, 'down')}
                  columnButton={{
                    label: `← Move ${label} to main column`,
                    onClick: () => onMoveSectionToColumn(sectionKey, 'main'),
                  }}
                />
              );
            })}
          </div>
        </div>

        <button className="btn btn-outline btn-sm" onClick={onResetOrder}>
          Reset to default layout
        </button>
      </div>
    );
  }

  const order = resolveSectionOrder(data);

  return (
    <div className="section-order-panel">
      <div className="section-order-list">
        {order.map((sectionKey, idx) => {
          const { label, isEmpty } = labelAndEmptyState(sectionKey, data);
          return (
            <SectionRow
              key={sectionKey}
              sectionKey={sectionKey}
              label={label}
              isEmpty={isEmpty}
              idx={idx}
              count={order.length}
              onMoveUp={() => onMoveSection(sectionKey, 'up')}
              onMoveDown={() => onMoveSection(sectionKey, 'down')}
            />
          );
        })}
      </div>
      <button className="btn btn-outline btn-sm" onClick={onResetOrder}>
        Reset to default layout
      </button>
    </div>
  );
}
