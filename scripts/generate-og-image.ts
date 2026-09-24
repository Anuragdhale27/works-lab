import * as path from 'path';
import { chromium } from 'playwright';

async function generateOgImage(): Promise<void> {
  const outPath = path.join(process.cwd(), 'public', 'og-image.png');

  // Create a simple HTML that renders the OG image with proper text rendering
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #0E7A5A 0%, #1a5a4a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      color: white;
    }
    .card {
      background: #FAF7F0;
      border-radius: 12px;
      padding: 60px;
      text-align: center;
      color: #1a1a1a;
      max-width: 900px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .logo {
      font-size: 14px;
      font-weight: 600;
      color: #0E7A5A;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #1a1a1a;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 20px;
      color: #666;
      margin-bottom: 24px;
      font-weight: 500;
    }
    .features {
      font-size: 16px;
      color: #0E7A5A;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">WORKS LAB</div>
    <h1>ATS Resume Templates for India</h1>
    <div class="subtitle">Professional templates designed to pass ATS screening</div>
    <div class="features">₹149 one-time · No subscription · Instant access</div>
  </div>
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle' });

  // Wait for fonts to render
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: outPath, type: 'png' });
  console.log(`✓ Generated OG image: public/og-image.png`);

  await browser.close();
}

generateOgImage().catch((error) => {
  console.error('Error generating OG image:', error);
  process.exit(1);
});
