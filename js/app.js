/* ============================================================
   WORKS LAB — app.js
   ============================================================

   HOW TO CONFIGURE:
   1. Replace PAYMENT_LINK with your actual payment URL (Razorpay/PayU/etc.)
   2. The builder page URL is auto-appended as ?template=<name>
      Your payment provider should redirect to:
      https://resume.workslab.in/builder.html?template=modern
   ============================================================ */

const CONFIG = {
  PAYMENT_LINK: "https://rzp.io/rzp/7gpzWZFg",   // ← PASTE YOUR PAYMENT LINK HERE
  PRODUCT_PRICE: 149,
  CURRENCY: "INR",
  SITE_NAME: "Works Lab",
  TAGLINE: "Build a resume that gets noticed."
};

// ---- Templates registry ----
const TEMPLATES = {
  modern:    { name: "Modern ATS",    best: "Software / IT / Tech",               color: "#1e3a5f" },
  classic:   { name: "Classic ATS",   best: "Corporate / Finance / Operations",   color: "#1a1a1a" },
  minimal:   { name: "Minimal ATS",   best: "Freshers / Students",                color: "#333333" },
  executive: { name: "Executive ATS", best: "Experienced Professionals",          color: "#0d0d0d" }
};

// ---- Payment redirect ----
function goToPayment(templateKey) {
  if (!CONFIG.PAYMENT_LINK || CONFIG.PAYMENT_LINK === "PASTE_PAYMENT_LINK_HERE") {
    alert("Payment not configured yet. Please contact us to complete your purchase.");
    return;
  }
  // Encode the template so the payment provider can pass it back in redirect URL
  const link = CONFIG.PAYMENT_LINK.includes("?")
    ? CONFIG.PAYMENT_LINK + "&template=" + templateKey
    : CONFIG.PAYMENT_LINK + "?template=" + templateKey;
  window.location.href = link;
}

// ---- Nav mobile menu ----
function initMobileNav() {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileNav");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
  document.addEventListener("click", e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
    }
  });
}

// ---- FAQ accordion ----
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    item.querySelector(".faq-q")?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(o => o.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

// ---- Scroll fade-in ----
function initFadeIn() {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ---- Toast ----
function showToast(msg, duration = 3000) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ---- Init on DOMContentLoaded ----
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFAQ();
  initFadeIn();

  // Wire all payment buttons
  document.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => goToPayment(btn.dataset.buy));
  });

  // Wire template preview links
  document.querySelectorAll("[data-preview]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "template.html?template=" + btn.dataset.preview;
    });
  });
});
