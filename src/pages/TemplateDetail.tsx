import { Link, Navigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TemplatePreview } from '../components/TemplatePreview';
import { TEMPLATE_KEYS, TEMPLATES, isTemplateKey } from '../templates';
import { CONFIG, goToPayment } from '../lib/config';

export function TemplateDetail() {
  const { templateKey } = useParams<{ templateKey: string }>();

  if (!isTemplateKey(templateKey)) {
    return <Navigate to="/template/modern" replace />;
  }

  const template = TEMPLATES[templateKey];
  const others = TEMPLATE_KEYS.filter((k) => k !== templateKey);

  return (
    <Layout>
      <section className="template-detail-hero">
        <div className="container">
          <Link to="/#templates" className="back-link">
            ← Back to templates
          </Link>

          <div className="template-detail-inner">
            {/* Live preview, rendered from the same component used by the builder */}
            <div className="template-detail-preview">
              <div className="template-detail-frame">
                <TemplatePreview template={template} />
              </div>
            </div>

            {/* Info */}
            <div className="template-detail-content">
              <span className="badge badge-green">ATS Friendly ✓</span>
              <h1 className="section-title" style={{ marginTop: '16px' }}>
                {template.name}
              </h1>

              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-700)', marginTop: '16px', marginBottom: '8px' }}>
                Best for: {template.best}
              </h2>

              <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '24px' }}>
                {template.description}
              </p>

              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-900)', marginTop: '24px', marginBottom: '12px' }}>
                Key Features
              </h2>
              <ul className="template-features">
                {template.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-900)', marginTop: '24px', marginBottom: '12px' }}>
                ATS-Friendly Design
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '24px' }}>
                {templateKey === 'modern' || templateKey === 'classic' || templateKey === 'minimal' || templateKey === 'executive'
                  ? 'Single-column layout with standard section headings. The exported PDF contains real, selectable text in reading order, so applicant tracking systems can parse it top to bottom.'
                  : 'Two-column layout. The main content comes first in the exported PDF, but some applicant tracking systems may still mix the two columns. Modern, Classic, Minimal and Executive are single-column and the safest choice.'}
              </p>

              <div className="template-price-large">₹{CONFIG.PRODUCT_PRICE}</div>
              <div className="template-price-note">One-time payment · Instant access · No subscription</div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => goToPayment(template.key)}>
                Use This Template – ₹{CONFIG.PRODUCT_PRICE}
              </button>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '12px' }}>
                Secure payment · Works on any device
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related templates */}
      <section style={{ background: 'var(--gray-100)', padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '32px' }}>
            Related Templates
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {others.map((key) => {
              const other = TEMPLATES[key];
              return (
                <Link
                  key={key}
                  to={`/template/${key}`}
                  style={{
                    display: 'block',
                    padding: '24px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                    {other.name} resume template
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '12px' }}>
                    Best for: {other.best}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                    View details →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
