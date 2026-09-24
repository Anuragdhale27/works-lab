import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function NotFound() {
  return (
    <Layout>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--gray-900)' }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--gray-700)' }}>Page not found</h2>
          <p style={{ fontSize: '1rem', color: 'var(--gray-600)', marginBottom: '40px', lineHeight: 1.6 }}>
            The page you're looking for doesn't exist. Let's get you back on track.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary btn-lg">
              Back to home
            </Link>
            <Link to="/#templates" className="btn btn-outline btn-lg">
              Browse templates
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
