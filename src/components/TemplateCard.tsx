import { Link } from 'react-router-dom';
import type { TemplateMeta } from '../templates';
import { TemplatePreview } from './TemplatePreview';
import { CONFIG, goToPayment } from '../lib/config';

export function TemplateCard({ template }: { template: TemplateMeta }) {
  return (
    <div className="template-card fade-in">
      <Link to={`/template/${template.key}`} className="template-preview" aria-label={`Preview ${template.name}`}>
        <TemplatePreview template={template} />
      </Link>
      <div className="template-card-body">
        <div className="template-card-name">{template.name}</div>
        <div className="template-card-tag">Best for: {template.best}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
            ATS Friendly
          </span>
        </div>
        <div className="template-card-footer">
          <div className="template-price">₹{CONFIG.PRODUCT_PRICE}</div>
          <div className="template-actions">
            <Link to={`/template/${template.key}`} className="btn btn-outline btn-sm">
              Preview
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => goToPayment(template.key)}>
              Get This
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
