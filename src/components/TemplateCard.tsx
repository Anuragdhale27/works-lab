import { Link } from 'react-router-dom';
import type { TemplateMeta } from '../templates';
import { TemplatePreview } from './TemplatePreview';
import { CONFIG, goToPayment } from '../lib/config';

export function TemplateCard({ template }: { template: TemplateMeta }) {
  return (
    <div className="lp-tpl-card fade-in">
      <Link to={`/template/${template.key}`} className="lp-tpl-preview" aria-label={`Preview ${template.name}`}>
        <TemplatePreview template={template} />
      </Link>
      <div className="lp-tpl-body">
        <span className="badge badge-green lp-tpl-badge">ATS Friendly</span>
        <div className="lp-tpl-name">{template.name}</div>
        <div className="lp-tpl-best">Best for: {template.best}</div>
        <div className="lp-tpl-footer">
          <div className="lp-tpl-price">₹{CONFIG.PRODUCT_PRICE}</div>
          <div className="lp-tpl-actions">
            <Link to={`/template/${template.key}`} className="btn btn-outline btn-sm">
              Preview
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => goToPayment(template.key)}>
              Get this
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
