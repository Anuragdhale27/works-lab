import { useState } from 'react';

interface FaqEntry {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqEntry[] = [
  {
    q: 'What does ₹149 include?',
    a: 'One-time access to all 4 resume templates and the resume builder. Fill in your details, preview in real-time, and download your resume as a PDF. No recurring charges.',
  },
  {
    q: 'Can I use different templates?',
    a: 'Yes. After payment, you can switch between Modern, Classic, Minimal, and Executive templates by revisiting the builder with a different template.',
  },
  {
    q: 'Is the resume ATS-friendly?',
    a: 'All Works Lab templates are built with clean, structured HTML that avoids tables, graphics, and unusual formatting that trip up ATS systems. Standard section headings and readable fonts are used throughout.',
  },
  {
    q: 'Can I edit my information later?',
    a: "Yes. Your data is saved in your browser's local storage. As long as you return to the same device and browser, your information will be preserved. You can update and re-download as many times as you need.",
  },
  {
    q: 'Do I need Microsoft Word?',
    a: 'No. Works Lab runs entirely in your browser. No software installation required. The PDF is generated directly from the browser.',
  },
  {
    q: 'Do I get a PDF?',
    a: 'Yes. Once you fill in your details, click "Download PDF" to get a clean A4 PDF ready to send to recruiters or upload to job portals.',
  },
  {
    q: 'Is there a subscription?',
    a: 'No. ₹149 is a one-time payment. There are no hidden fees, renewals, or monthly charges.',
  },
  {
    q: 'Can I use this resume for multiple applications?',
    a: 'Absolutely. Download it once and use it for as many applications as you want. You can also update details and download a fresh version any time.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list fade-in">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div className={`faq-item${open ? ' open' : ''}`} key={i}>
            <button
              type="button"
              className="faq-q"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              {item.q} <span className="faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="faq-a" id={panelId} role="region" aria-labelledby={buttonId}>
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
