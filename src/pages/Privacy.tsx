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

          <h3>What data we collect</h3>
          <p>
            Works Lab does not collect, store, or transmit your resume data. All information you enter in the resume
            builder is stored locally in your browser using localStorage and never sent to any server.
          </p>

          <h3>Payment data</h3>
          <p>Payments are processed by our payment provider. Works Lab does not store your payment card details.</p>

          <h3>Contact</h3>
          <p>
            For any privacy questions, email us at <a href="mailto:hello@workslab.in">hello@workslab.in</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
