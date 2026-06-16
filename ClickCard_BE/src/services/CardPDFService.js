const { renderCardHtml } = require('./CardTemplateService');

/**
 * Renders a chosen Digital Card template to PDF using puppeteer-core.
 *
 * Requires a Chromium binary on the host. Set via env:
 *   PUPPETEER_EXECUTABLE_PATH=/path/to/chromium-or-chrome
 *
 * On Vercel, install `@sparticuz/chromium` and point this at its `executablePath`.
 * If puppeteer-core / Chromium is unavailable, throws a clear error so the
 * controller can return a 503 to the client.
 */
async function renderCardPdf(ctx) {
  const puppeteer = require('puppeteer-core');
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    detectLocalChrome();
  if (!executablePath) {
    const err = new Error(
      'No Chromium executable found. Set PUPPETEER_EXECUTABLE_PATH on the server.',
    );
    err.code = 'NO_CHROMIUM';
    throw err;
  }

  const html = renderCardHtml(ctx);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 700, height: 1000, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20_000 });
    const pdf = await page.pdf({
      width: '700px',
      height: '1000px',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdf;
  } finally {
    await browser.close().catch(() => {});
  }
}

function detectLocalChrome() {
  // Best-effort detection for common install paths on win/mac/linux.
  const candidates = [
    process.platform === 'win32' && 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    process.platform === 'win32' && 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.platform === 'win32' && 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.platform === 'darwin' && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    process.platform === 'linux' && '/usr/bin/google-chrome',
    process.platform === 'linux' && '/usr/bin/chromium-browser',
    process.platform === 'linux' && '/usr/bin/chromium',
  ].filter(Boolean);
  const fs = require('fs');
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch { /* ignore */ }
  }
  return null;
}

module.exports = { renderCardPdf };
