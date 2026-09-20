import { Link, Navigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TemplatePreview } from '../components/TemplatePreview';
import { TemplateCard } from '../components/TemplateCard';
import { TEMPLATE_KEYS, TEMPLATES, isTemplateKey } from '../templates';
import { CONFIG, goToPayment } from '../lib/config';

export function TemplateDetail() {
  const { templateKey } = useParams<{ templateKey: string }>();

  if (!isTemplateKey(templateKey)) {
    return <Navigate to="/template/modern" replace />;
  }

  const template = TEMPLATES[templateKey];
  const others = TEMPLATE_KEYS.filter((k) => k !== templateKey).slice(0, 3);

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

              <div className="template-meta">
                <span style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>Best for: {template.best}</span>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '24px' }}>
                {template.description}
              </p>

              <div className="template-price-large">₹{CONFIG.PRODUCT_PRICE}</div>
              <div className="template-price-note">One-time payment · Instant access · No subscription</div>

              <ul className="template-features">
                <li>ATS-friendly HTML structure</li>
                <li>Professional, recruiter-tested layout</li>
                <li>Easy guided form — no design skills needed</li>
                <li>Live preview as you type</li>
                <li>Download as clean A4 PDF</li>
                <li>Saved to your browser — edit any time</li>
              </ul>

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

      {/* Other templates */}
      <section style={{ background: 'var(--gray-100)', padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '32px' }}>
            Other templates
          </h2>
          <div className="templates-grid">
            {others.map((key) => (
              <TemplateCard key={key} template={TEMPLATES[key]} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
