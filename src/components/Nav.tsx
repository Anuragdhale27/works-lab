import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONFIG, goToPayment } from '../lib/config';

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
                <a href="/#how-it-works">How it works</a>
              </li>
              <li>
                <a href="/#pricing">Pricing</a>
              </li>
              <li>
                <a href="/#faq">FAQ</a>
              </li>
              <li>
                <a
                  href="/#templates"
                  className="nav-cta"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPayment('modern');
                  }}
                >
                  Build resume – ₹{CONFIG.PRODUCT_PRICE}
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
        <a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a>
        <a href="/#pricing" onClick={() => setOpen(false)}>Pricing</a>
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
          Build resume – ₹{CONFIG.PRODUCT_PRICE}
        </a>
      </div>
    </>
  );
}
