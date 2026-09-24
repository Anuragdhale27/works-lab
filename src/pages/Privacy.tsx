import { Layout } from '../components/Layout';

export function Privacy() {
  return (
    <Layout>
      <section className="legal-page">
        <div className="container">
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '32px' }}>
            Privacy Policy
          </h1>
          <p className="legal-updated">Last updated: January 2025</p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>What data we collect</h2>
          <p>
            Works Lab does not collect, store, or transmit your resume data. All information you enter in the resume
            builder is stored locally in your browser using localStorage and never sent to any server.
          </p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>Payment data</h2>
          <p>Payments are processed by our payment provider. Works Lab does not store your payment card details.</p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>Contact</h2>
          <p>
            For any privacy questions, email us at <a href="mailto:adwork895@gmail.com">adwork895@gmail.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
