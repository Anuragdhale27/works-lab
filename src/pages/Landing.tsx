import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TemplateCard } from '../components/TemplateCard';
import { TemplatePreview } from '../components/TemplatePreview';
import { FaqAccordion } from '../components/FaqAccordion';
import { TEMPLATE_KEYS, TEMPLATES } from '../templates';
import { CONFIG, goToPayment } from '../lib/config';
import { sampleResumeData } from '../lib/sampleData';
import sampleAvatar from '../assets/sample-avatar.png';
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
                  <TemplatePreview template={TEMPLATES.modern} photo={sampleAvatar} />
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
              <li className="fade-in">{TEMPLATE_KEYS.length} ATS-safe templates</li>
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
                <p>Choose from Modern, Classic, Minimal, Executive, Sidebar or Split — whichever fits your role.</p>
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

        {/* TEMPLATES */}
        <section id="templates" className="lp-templates">
          <div className="container">
            <div className="lp-section-head">
              <span className="lp-eyebrow fade-in">Resume templates</span>
              <h2 className="lp-section-title fade-in">Six templates. All built to be read by a machine first.</h2>
              <p className="lp-section-sub fade-in">
                Pick the one that fits your field, then fill it in — you can switch anytime in the builder without
                losing your details.
              </p>
            </div>

            <div className="lp-templates-grid">
              {TEMPLATE_KEYS.map((key) => (
                <TemplateCard key={key} template={TEMPLATES[key]} />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-features">
          <div className="container">
            <div className="lp-section-head">
              <span className="lp-eyebrow fade-in">What's included</span>
              <h2 className="lp-section-title fade-in">Everything in the builder.</h2>
              <p className="lp-section-sub fade-in">
                No filler features — this is what's actually in the product.
              </p>
            </div>

            <div className="lp-features-grid">
              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="1.5" />
                  <line x1="5" y1="14" x2="19" y2="14" strokeDasharray="2.5 2.5" />
                  <line x1="8" y1="7" x2="16" y2="7" />
                  <line x1="8" y1="10" x2="14" y2="10" />
                </svg>
                <h3>Live true-A4 preview</h3>
                <p>The preview beside the form is scaled from the exact A4 page you'll print, with markers showing where each page will break.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M4 12a8 8 0 1 1 8 8" />
                  <path d="M4 12l3-3M4 12l3 3" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <h3>Guided sections with a completeness meter</h3>
                <p>Personal info, summary, experience and more, broken into clear sections with a progress bar that tells you what's still missing.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 3v12" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M5 19h14" />
                </svg>
                <h3>Load example resume</h3>
                <p>Not sure where to start? Load a fully filled example resume and edit it in place instead of facing a blank form.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 21V9" />
                  <path d="M8 13l4-4 4 4" />
                  <rect x="4" y="3" width="16" height="4" rx="1" />
                </svg>
                <h3>JSON backup, export and import</h3>
                <p>Export everything you've entered as a JSON file at any time, and import it again to restore or move it to another device.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="4" width="8" height="16" rx="1.5" />
                  <rect x="13" y="4" width="8" height="16" rx="1.5" />
                  <path d="M9 20h-.01" />
                </svg>
                <h3>Mobile Edit / Preview toggle</h3>
                <p>On a phone, a simple tab switches between editing your details and seeing the full-page preview, instead of squeezing both in at once.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M8 5l1.3-2h5.4L16 5" />
                </svg>
                <h3>Optional photo</h3>
                <p>Add a photo if your field expects one — it's resized and cropped right in your browser, and just as easy to remove again.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M7 3h7l4 4v14H7z" />
                  <path d="M14 3v4h4" />
                  <line x1="9.5" y1="13" x2="14.5" y2="13" />
                  <line x1="9.5" y1="16" x2="14.5" y2="16" />
                </svg>
                <h3>Real-text, ATS-readable PDF</h3>
                <p>Exported through your browser's own print pipeline, so every word stays selectable, searchable text — not a flattened image.</p>
              </div>

              <div className="lp-feature-card fade-in">
                <svg className="lp-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="1.5" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <h3>Private by design</h3>
                <p>There's no backend and no account. Everything lives in your browser's local storage — nothing is ever sent to a server.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="lp-pricing">
          <div className="container">
            <div className="lp-section-head lp-section-head--center">
              <span className="lp-eyebrow fade-in">Pricing</span>
              <h2 className="lp-section-title fade-in">One price. Everything included.</h2>
              <p className="lp-section-sub fade-in">No tiers to compare, no feature paywalled behind a "pro" plan.</p>
            </div>

            <div className="lp-pricing-card fade-in">
              <div className="lp-pricing-top">
                <span className="lp-pricing-label">Works Lab access</span>
                <div className="lp-pricing-price">
                  <span className="lp-pricing-currency">₹</span>
                  {CONFIG.PRODUCT_PRICE}
                  <span className="lp-pricing-period">one-time</span>
                </div>
                <p className="lp-pricing-note">No subscription. No auto-renewal. Pay once, use it whenever you need it.</p>
              </div>

              <ul className="lp-pricing-list">
                <li>All 6 templates — Modern, Classic, Minimal, Executive, Sidebar, Split</li>
                <li>The full guided builder, with unlimited edits</li>
                <li>Live true-A4 preview with page-break markers</li>
                <li>Unlimited real-text PDF exports via your browser's print dialog</li>
                <li>JSON backup export and import</li>
                <li>Your data stays on your device — nothing stored on a server</li>
              </ul>

              <button className="btn btn-primary btn-lg lp-pricing-cta" onClick={() => goToPayment('modern')}>
                Build my resume — ₹{CONFIG.PRODUCT_PRICE}
              </button>
              <p className="lp-pricing-fine">
                Secure payment. Instant access.{' '}
                <Link to="/refund">Refund policy</Link>
              </p>
            </div>
          </div>
        </section>

        {/* BUILT FOR */}
        <section className="lp-built-for">
          <div className="container">
            <div className="lp-section-head">
              <span className="lp-eyebrow fade-in">Built for</span>
              <h2 className="lp-section-title fade-in">Whoever you are in your career, there's a template for it.</h2>
              <p className="lp-section-sub fade-in">
                Each template is designed around how a particular kind of application actually gets read.
              </p>
            </div>

            <div className="lp-built-grid">
              {TEMPLATE_KEYS.map((key) => {
                const t = TEMPLATES[key];
                return (
                  <div className="lp-built-card fade-in" key={key}>
                    <span className="lp-built-template">{t.name}</span>
                    <h3>{t.best}</h3>
                    <p>{t.description}</p>
                    <Link to={`/template/${key}`} className="lp-built-link">
                      See the {t.name} template →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-faq">
          <div className="container">
            <div className="lp-section-head lp-section-head--center">
              <span className="lp-eyebrow fade-in">FAQ</span>
              <h2 className="lp-section-title fade-in">Common questions.</h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="lp-final-cta">
          <div className="container">
            <h2 className="lp-final-cta-title fade-in">Your next application deserves a better resume.</h2>
            <p className="lp-final-cta-sub fade-in">Build it in minutes. Export a real, ATS-readable PDF.</p>
            <button className="btn btn-primary btn-lg fade-in" onClick={() => goToPayment('modern')}>
              Build my resume — ₹{CONFIG.PRODUCT_PRICE}
            </button>
            <p className="lp-final-cta-trust fade-in">One-time payment · Instant access · No subscription</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
