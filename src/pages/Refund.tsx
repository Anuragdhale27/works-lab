import { Layout } from '../components/Layout';

export function Refund() {
  return (
    <Layout>
      <section className="legal-page">
        <div className="container">
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '32px' }}>
            Refund Policy
          </h1>
          <p>
            Because Works Lab sells digital products that are immediately accessible after payment, we generally do
            not offer refunds.
          </p>
          <p>
            If you experience a technical issue that prevents you from accessing the resume builder, please email{' '}
            hello@workslab.in within 7 days of purchase and we will work to resolve it.
          </p>
          <p>
            For any concerns, contact us at <a href="mailto:hello@workslab.in">hello@workslab.in</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
