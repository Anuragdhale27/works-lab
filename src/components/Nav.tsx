import { useState } from 'react';
import { Link } from 'react-router-dom';
import { goToPayment } from '../lib/config';

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav>
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="nav-logo">
              Works<span>Lab</span>
            </Link>
            <ul className="nav-links">
              <li>
                <a href="/#templates">Templates</a>
              </li>
              <li>
                <a href="/#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="/#faq">FAQ</a>
              </li>
              <li>
                <a href="/#templates" className="nav-cta" onClick={(e) => { e.preventDefault(); goToPayment('modern'); }}>
                  Build Resume – ₹149
                </a>
              </li>
            </ul>
            <button
              className="nav-menu-btn"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobileNav"
              onClick={() => setOpen((o) => !o)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav${open ? ' open' : ''}`} id="mobileNav">
        <a href="/#templates" onClick={() => setOpen(false)}>Templates</a>
        <a href="/#how-it-works" onClick={() => setOpen(false)}>How It Works</a>
        <a href="/#faq" onClick={() => setOpen(false)}>FAQ</a>
        <a
          href="/#templates"
          style={{ color: 'var(--accent)', fontWeight: 700 }}
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            goToPayment('modern');
          }}
        >
          Build Resume – ₹149
        </a>
      </div>
    </>
  );
}
