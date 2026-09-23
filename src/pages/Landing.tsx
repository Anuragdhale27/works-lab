import { Layout } from '../components/Layout';
import { TemplateCard } from '../components/TemplateCard';
import { TemplatePreview } from '../components/TemplatePreview';
import { FaqAccordion } from '../components/FaqAccordion';
import { TEMPLATE_KEYS, TEMPLATES } from '../templates';
import { CONFIG, goToPayment } from '../lib/config';
import { sampleResumeData } from '../lib/sampleData';
import { useFadeIn } from '../hooks/useFadeIn';
import '../styles/landing.css';

export function Landing() {
  useFadeIn();

  const firstExperience = sampleResumeData.experience[0];
  const firstEducation = sampleResumeData.education[0];

  return (
    <Layout>
      <div className="lp-page">
        {/* HERO */}
        <section className="lp-hero">
          <div className="container lp-hero-inner">
            <div className="lp-hero-text">
              <span className="lp-eyebrow fade-in">Built for the Indian job market</span>
              <h1 className="lp-hero-title fade-in">A resume that gets past the bots and into a human's hands.</h1>
              <p className="lp-hero-sub fade-in">
                A real, <strong>selectable-text PDF</strong> that applicant tracking systems can actually read.{' '}
                <strong>₹{CONFIG.PRODUCT_PRICE} once</strong> — no subscription. Your details stay{' '}
                <strong>on your device</strong> — nothing is ever sent to a server.
              </p>
              <div className="lp-hero-actions fade-in">
                <button className="btn btn-primary btn-lg" onClick={() => goToPayment('modern')}>
                  Build my resume — ₹{CONFIG.PRODUCT_PRICE}
                </button>
                <a href="#templates" className="btn btn-outline btn-lg">
                  See templates
                </a>
              </div>
              <p className="lp-hero-trust fade-in">
                One-time payment
                <span className="lp-trust-dot"></span>
                Instant access
                <span className="lp-trust-dot"></span>
                No subscription
              </p>
            </div>

            <div className="lp-hero-visual fade-in" aria-hidden="true">
              <div className="lp-preview-stack">
                <div className="lp-preview-card lp-preview-card--back">
                  <TemplatePreview template={TEMPLATES.classic} />
                </div>
                <div className="lp-preview-card lp-preview-card--front">
                  <TemplatePreview template={TEMPLATES.modern} />
                </div>
                <span className="lp-preview-tag">Real, ATS-readable PDF</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF STRIP */}
        <section className="lp-proof">
          <div className="container">
            <ul className="lp-proof-list">
              <li className="fade-in">4 ATS-safe templates</li>
              <li className="fade-in">Real text PDF — not an image</li>
              <li className="fade-in">₹{CONFIG.PRODUCT_PRICE} once. No subscription.</li>
              <li className="fade-in">Your data never leaves your browser</li>
            </ul>
          </div>
        </section>

        {/* THE DIFFERENTIATOR: WHAT AN ATS ACTUALLY READS */}
        <section className="lp-ats">
          <div className="container">
            <div className="lp-ats-head">
              <span className="lp-eyebrow fade-in">What an ATS actually reads</span>
              <h2 className="lp-section-title fade-in">
                Your Works Lab PDF isn't a picture of a resume. It's real text.
              </h2>
              <p className="lp-section-sub fade-in">
                Export uses your browser's own print pipeline, so every character — your name, dates, bullet points
                — stays selectable, searchable text in the PDF. That's exactly what an applicant tracking system
                parses.
              </p>
            </div>

            <div className="lp-ats-grid">
              <div className="lp-ats-resume fade-in">
                <TemplatePreview template={TEMPLATES.modern} />
              </div>
              <div className="lp-ats-arrow fade-in">→</div>
              <div className="lp-ats-parsed fade-in">
                <div className="lp-ats-parsed-label">Parsed by an ATS</div>
                <dl className="lp-ats-fields">
                  <div>
                    <dt>Name</dt>
                    <dd>{sampleResumeData.personal.name}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{sampleResumeData.personal.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{sampleResumeData.personal.phone}</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>
                      {firstExperience.title} · {firstExperience.company}
                    </dd>
                  </div>
                  <div>
                    <dt>Education</dt>
                    <dd>{firstEducation.degree}</dd>
                  </div>
                  <div>
                    <dt>Skills</dt>
                    <dd>{sampleResumeData.skills.slice(0, 5).join(', ')}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <p className="lp-ats-note fade-in">
              See for yourself — open a resume you've downloaded and try selecting the text.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="lp-how" id="how-it-works">
          <div className="container">
            <span className="lp-eyebrow fade-in">How it works</span>
            <h2 className="lp-section-title fade-in">Three steps. No design skills needed.</h2>

            <ol className="lp-how-steps">
              <li className="fade-in">
                <span className="lp-how-num" aria-hidden="true">01</span>
                <h3>Pick a template</h3>
                <p>Choose Modern, Classic, Minimal or Executive — whichever fits your role.</p>
              </li>
              <li className="fade-in">
                <span className="lp-how-num" aria-hidden="true">02</span>
                <h3>Fill a guided form</h3>
                <p>Type your details into a simple form while a true-to-size A4 preview updates live beside it.</p>
              </li>
              <li className="fade-in">
                <span className="lp-how-num" aria-hidden="true">03</span>
                <h3>Save as PDF</h3>
                <p>Use your browser's print dialog to save a real, ATS-readable PDF — no extra software.</p>
              </li>
            </ol>

            <div style={{ textAlign: 'center', marginTop: '48px' }} className="fade-in">
              <button className="btn btn-dark btn-lg" onClick={() => goToPayment('modern')}>
                Build my resume — ₹{CONFIG.PRODUCT_PRICE}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* TEMPLATES */}
      <section id="templates" className="templates-section">
        <div className="container">
          <div className="section-label fade-in">Resume Templates</div>
          <h2 className="section-title fade-in">Choose your resume style.</h2>
          <p className="section-sub fade-in">All templates are ATS-friendly and designed for the Indian job market.</p>

          <div className="templates-grid" style={{ marginTop: '48px' }}>
            {TEMPLATE_KEYS.map((key) => (
              <TemplateCard key={key} template={TEMPLATES[key]} />
            ))}
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section>
        <div className="container">
          <div className="section-label fade-in">What You Get</div>
          <h2 className="section-title fade-in">Everything you need. Nothing you don't.</h2>

          <div className="features-grid" style={{ marginTop: '48px' }}>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">🎯</div>
              <div>
                <h4>ATS-Friendly Structure</h4>
                <p>Designed to pass through applicant tracking systems used by most companies.</p>
              </div>
            </div>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">✨</div>
              <div>
                <h4>Professional Formatting</h4>
                <p>Clean layouts that let your experience speak for itself.</p>
              </div>
            </div>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">📝</div>
              <div>
                <h4>Guided Form</h4>
                <p>Fill in sections step by step — no design skills needed.</p>
              </div>
            </div>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">🎨</div>
              <div>
                <h4>4 Resume Designs</h4>
                <p>Modern, Classic, Minimal and Executive — pick what fits.</p>
              </div>
            </div>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">📄</div>
              <div>
                <h4>PDF Download</h4>
                <p>Get a clean, print-ready A4 PDF to send anywhere.</p>
              </div>
            </div>
            <div className="feature-item fade-in">
              <div className="feature-icon" aria-hidden="true">💳</div>
              <div>
                <h4>One-Time Payment</h4>
                <p>₹149 once. No monthly fee. No subscription ever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — placeholder content, clearly marked; replace with
          real feedback before launch. Left as visible placeholders rather
          than fabricated realistic-sounding reviews. */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-label fade-in">What People Say</div>
          <h2 className="section-title fade-in">From people who've used it.</h2>
          <p className="section-sub fade-in" style={{ marginTop: '4px' }}>
            Placeholder examples — to be replaced with real customer feedback.
          </p>

          <div className="testimonials-grid" style={{ marginTop: '48px' }}>
            <div className="testimonial-card fade-in">
              <div className="testimonial-stars" aria-hidden="true">★★★★★</div>
              <p className="testimonial-quote">
                "Finally got my resume into a format I was comfortable sending to recruiters. Formatting was always
                my weak point — this sorted it immediately."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RS</div>
                <div>
                  <div className="testimonial-name">Rohit S. (placeholder)</div>
                  <div className="testimonial-role">Software Engineer, Pune</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card fade-in">
              <div className="testimonial-stars" aria-hidden="true">★★★★★</div>
              <p className="testimonial-quote">
                "Much easier than formatting everything manually in Word. Took me about 20 minutes to fill in and
                download a resume I'm actually happy with."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AP</div>
                <div>
                  <div className="testimonial-name">Ananya P. (placeholder)</div>
                  <div className="testimonial-role">MBA Fresher, Hyderabad</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card fade-in">
              <div className="testimonial-stars" aria-hidden="true">★★★★★</div>
              <p className="testimonial-quote">
                "Clean design, simple process. My old resume was a mess of copied formats from different sources.
                This is the first resume where everything looks consistent."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">VK</div>
                <div>
                  <div className="testimonial-name">Vignesh K. (placeholder)</div>
                  <div className="testimonial-role">Operations Analyst, Chennai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="container">
          <div className="section-label fade-in">FAQ</div>
          <h2 className="section-title fade-in">Common questions.</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2 className="section-title fade-in">Your next application deserves a better resume.</h2>
          <p className="section-sub fade-in">Professional. ATS-friendly. Ready in minutes.</p>
          <button className="btn btn-primary btn-lg fade-in" onClick={() => goToPayment('modern')}>
            Build My Resume – ₹149
          </button>
          <p className="final-cta-trust fade-in">One-time payment · Instant access · No subscription</p>
        </div>
      </section>
    </Layout>
  );
}
