import { Layout } from '../components/Layout';
import { TemplateCard } from '../components/TemplateCard';
import { FaqAccordion } from '../components/FaqAccordion';
import { TEMPLATE_KEYS, TEMPLATES } from '../templates';
import { goToPayment } from '../lib/config';
import { useFadeIn } from '../hooks/useFadeIn';

export function Landing() {
  useFadeIn();

  return (
    <Layout>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-badge fade-in">
                <span className="badge">ATS-Friendly Resume Templates</span>
              </div>
              <h1 className="fade-in">Stop sending the same boring resume.</h1>
              <p className="hero-sub fade-in">
                Create a professional, ATS-friendly resume in minutes — without fighting with Word formatting.
              </p>
              <div className="hero-actions fade-in">
                <button className="btn btn-primary btn-lg" onClick={() => goToPayment('modern')}>
                  Build My Resume – ₹149
                </button>
                <a href="#templates" className="btn btn-outline btn-lg">
                  View Templates
                </a>
              </div>
              <div className="trust-text fade-in">
                One-time payment
                <span className="trust-dot"></span>
                Instant access
                <span className="trust-dot"></span>
                No subscription
              </div>
            </div>

            <div className="hero-visual fade-in">
              <div style={{ position: 'relative', maxWidth: '340px', margin: '0 auto' }}>
                <span className="badge-floating badge-green">ATS Friendly ✓</span>
                <div className="resume-mockup">
                  <div className="resume-mockup-header">
                    <div className="rm-name">Rahul Sharma</div>
                    <div className="rm-title">Software Engineer · Bengaluru, India</div>
                    <div className="rm-contact">
                      <span>rahul@email.com</span>
                      <span>+91 98765 43210</span>
                      <span>linkedin.com/in/rahuls</span>
                    </div>
                  </div>
                  <div className="resume-mockup-body">
                    <div className="rm-section">
                      <div className="rm-section-title">Professional Summary</div>
                      <div className="rm-line"></div>
                      <div className="rm-line short"></div>
                    </div>
                    <div className="rm-section">
                      <div className="rm-section-title">Work Experience</div>
                      <div className="rm-exp-title">Senior Software Engineer</div>
                      <div className="rm-exp-sub">Infosys · Jun 2022 – Present</div>
                      <div className="rm-line"></div>
                      <div className="rm-line shorter"></div>
                    </div>
                    <div className="rm-section">
                      <div className="rm-section-title">Education</div>
                      <div className="rm-exp-title">B.Tech Computer Science</div>
                      <div className="rm-exp-sub">VIT Vellore · 2018–2022</div>
                    </div>
                    <div className="rm-section">
                      <div className="rm-section-title">Skills</div>
                      <div className="rm-skills">
                        <span className="rm-skill-tag">React</span>
                        <span className="rm-skill-tag">Node.js</span>
                        <span className="rm-skill-tag">Python</span>
                        <span className="rm-skill-tag">AWS</span>
                        <span className="rm-skill-tag">SQL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section">
        <div className="container">
          <div className="section-label fade-in">The Real Problem</div>
          <h2 className="section-title fade-in" style={{ color: 'white' }}>
            Your resume shouldn't be the reason you get ignored.
          </h2>

          <div className="problems-grid" style={{ marginTop: '48px' }}>
            <div className="problem-card fade-in">
              <div className="problem-icon" aria-hidden="true">❌</div>
              <h3>Poor Formatting</h3>
              <p>Inconsistent spacing, odd fonts, misaligned sections — recruiters notice these instantly and move on.</p>
            </div>
            <div className="problem-card fade-in">
              <div className="problem-icon" aria-hidden="true">❌</div>
              <h3>Difficult-to-Read Layouts</h3>
              <p>Overly complex designs make it hard for hiring managers to quickly find what they're looking for.</p>
            </div>
            <div className="problem-card fade-in">
              <div className="problem-icon" aria-hidden="true">❌</div>
              <h3>ATS Screening Failures</h3>
              <p>Applicant Tracking Systems reject resumes with wrong formatting before a human ever sees them.</p>
            </div>
          </div>

          <div className="solution-box fade-in">
            <p>
              Works Lab gives you clean, professional resume templates designed around readability and ATS-friendly
              structure — so your application gets where it needs to go.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="container">
          <div className="section-label fade-in">Simple Process</div>
          <h2 className="section-title fade-in">Three steps to a better resume.</h2>

          <div className="how-grid">
            <div className="how-card fade-in">
              <div className="how-step">1</div>
              <h3>Choose a Template</h3>
              <p>Pick a design that fits your career stage — modern, classic, minimal, or executive.</p>
            </div>
            <div className="how-card fade-in">
              <div className="how-step">2</div>
              <h3>Add Your Details</h3>
              <p>Fill out a simple guided form. Your resume preview updates as you type.</p>
            </div>
            <div className="how-card fade-in">
              <div className="how-step">3</div>
              <h3>Download Your Resume</h3>
              <p>Get a polished A4 PDF ready to send to any recruiter or portal.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }} className="fade-in">
            <button className="btn btn-dark btn-lg" onClick={() => goToPayment('modern')}>
              Create My Resume – ₹149
            </button>
          </div>
        </div>
      </section>

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
