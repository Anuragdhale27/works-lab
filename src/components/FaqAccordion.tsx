import { useState } from 'react';
import { CONFIG } from '../lib/config';

interface FaqEntry {
  q: string;
  a: string;
}

function buildFaqItems(): FaqEntry[] {
  const price = CONFIG.PRODUCT_PRICE;
  return [
  {
    q: `What does ₹${price} include?`,
    a: `One-time access to all 6 resume templates and the resume builder. Fill in your details, preview in real time, and export your resume as a PDF whenever you like. No recurring charges.`,
  },
  {
    q: 'Can I use different templates?',
    a: 'Yes. The builder has a template switcher right above the live preview — pick from Modern, Classic, Minimal, Executive, Sidebar or Split at any point and your entered details carry over automatically.',
  },
  {
    q: 'Is the resume ATS-friendly?',
    a: 'All six templates are built with clean, structured markup — no tables, text boxes or graphics that trip up applicant tracking systems. Standard section headings and readable fonts are used throughout.',
  },
  {
    q: 'Can I edit my information later?',
    a: "Yes. Your data is saved automatically to your browser's local storage as you type. As long as you return on the same device and browser, it will be there — update and re-download as many times as you need.",
  },
  {
    q: 'Is my data private?',
    a: 'Works Lab has no backend and no account. Everything you type — including your photo, if you add one — is stored only in your own browser. Nothing is ever uploaded to a server, so we never see your resume.',
  },
  {
    q: 'Do I need Microsoft Word or design software?',
    a: 'No. Works Lab runs entirely in your browser. Fill in the guided form, watch the true-to-size A4 preview update live, and export straight from there — no installs.',
  },
  {
    q: 'How do I get the PDF?',
    a: 'Click "Download PDF" and choose "Save as PDF" as the destination in your browser’s print dialog. That produces a real, selectable-text A4 PDF — not a flattened image — ready to send to recruiters or upload to job portals.',
  },
  {
    q: 'Is there a subscription?',
    a: `No. ₹${price} is a one-time payment for lifetime access to the builder and all six templates. There are no renewals or monthly charges.`,
  },
  {
    q: 'Can I use this resume for multiple applications?',
    a: 'Absolutely. Download it once and reuse it for as many applications as you like. You can also come back, update your details and export a fresh PDF any time.',
  },
  ];
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = buildFaqItems();

  return (
    <div className="lp-faq-list fade-in">
      {items.map((item, i) => {
        const open = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div className={`lp-faq-item${open ? ' open' : ''}`} key={i}>
            <button
              type="button"
              className="lp-faq-q"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              {item.q} <span className="lp-faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="lp-faq-a" id={panelId} role="region" aria-labelledby={buttonId}>
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
