// ============================================================
// WORKS LAB — site config
//
// HOW TO CONFIGURE:
// 1. Replace PAYMENT_LINK with your actual payment URL (Razorpay/PayU/etc.)
// 2. The builder page URL is auto-appended as ?template=<name>
//    Your payment provider should redirect to:
//    https://resume.workslab.in/builder?template=modern
// ============================================================

export const CONFIG = {
  PAYMENT_LINK: 'https://rzp.io/rzp/7gpzWZFg', // <- your payment link
  PRODUCT_PRICE: 149,
  CURRENCY: 'INR',
  SITE_NAME: 'Works Lab',
  TAGLINE: 'Build a resume that gets noticed.',
};

/** Redirects the browser to the configured payment link, tagging the
 * chosen template so the payment provider can pass it back on redirect. */
export function goToPayment(templateKey: string): void {
  if (!CONFIG.PAYMENT_LINK || CONFIG.PAYMENT_LINK === 'PASTE_PAYMENT_LINK_HERE') {
    window.alert('Payment not configured yet. Please contact us to complete your purchase.');
    return;
  }
  const link = CONFIG.PAYMENT_LINK.includes('?')
    ? `${CONFIG.PAYMENT_LINK}&template=${templateKey}`
    : `${CONFIG.PAYMENT_LINK}?template=${templateKey}`;
  window.location.href = link;
}
