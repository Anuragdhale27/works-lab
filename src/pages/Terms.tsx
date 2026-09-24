import { Layout } from '../components/Layout';

export function Terms() {
  return (
    <Layout>
      <section className="legal-page">
        <div className="container">
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '32px' }}>
            Terms of Service
          </h1>
          <p className="legal-updated">By using Works Lab, you agree to these terms.</p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>Product</h2>
          <p>
            Works Lab provides digital resume templates for personal, professional use. The ₹149 fee grants you
            access to use the builder and download your resume.
          </p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>Permitted use</h2>
          <p>Templates may be used for your own job applications. You may not resell or redistribute the templates.</p>

          <h2 style={{ fontSize: '1.2rem', marginTop: '24px', marginBottom: '12px' }}>Contact</h2>
          <p>
            <a href="mailto:adwork895@gmail.com">adwork895@gmail.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
