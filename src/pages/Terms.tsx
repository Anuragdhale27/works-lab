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

          <h3>Product</h3>
          <p>
            Works Lab provides digital resume templates for personal, professional use. The ₹149 fee grants you
            access to use the builder and download your resume.
          </p>

          <h3>Permitted use</h3>
          <p>Templates may be used for your own job applications. You may not resell or redistribute the templates.</p>

          <h3>Contact</h3>
          <p>
            <a href="mailto:hello@workslab.in">hello@workslab.in</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
