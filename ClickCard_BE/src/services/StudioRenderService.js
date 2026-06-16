/**
 * Studio renderer — renders a chosen template (by slug or admin-supplied HTML)
 * to PDF / PNG / SVG using puppeteer-core.
 *
 * Each render uses the BuildCardContext shape (CardPDFService) for user data,
 * extended with `qrUrl` so QR posters can embed the user's share link.
 */

const { StudioTemplate } = require('../models/StudioTemplate');

const PALETTE_BG = {
  light: '#ffffff',
  dark: '#0b0820',
};

/** Default fallback HTML templates keyed by category. Used when the row's
 *  html_template column is empty (e.g. admin-seeded templates). */
function defaultHtmlForCategory(category) {
  if (category === 'resume') {
    return `
<div class="page" style="padding:48px;color:{{fg}};background:{{bg}};font-family:Inter,sans-serif;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <h1 style="margin:0;font-size:42px;font-weight:900;letter-spacing:-0.02em;">{{fullName}}</h1>
      <div style="color:{{primary}};font-weight:800;text-transform:uppercase;letter-spacing:0.1em;font-size:13px;margin-top:6px;">{{tagline}}</div>
    </div>
    <div style="text-align:right;font-size:12px;color:{{subtle}};">
      <div>{{email}}</div><div>{{phone}}</div><div>{{city}}</div>
    </div>
  </div>
  <div style="height:2px;background:{{primary}};margin:28px 0;"></div>
  <div style="font-size:14px;line-height:1.7;color:{{subtle}};">{{bio}}</div>
  <h2 style="margin-top:32px;font-size:18px;color:{{primary}};letter-spacing:0.04em;">Experience</h2>
  <div>{{experienceList}}</div>
  <h2 style="margin-top:24px;font-size:18px;color:{{primary}};letter-spacing:0.04em;">Education</h2>
  <div>{{educationList}}</div>
  <h2 style="margin-top:24px;font-size:18px;color:{{primary}};letter-spacing:0.04em;">Links</h2>
  <div>{{socialList}}</div>
</div>`;
  }
  if (category === 'visiting_card') {
    return `
<div class="page" style="padding:0;background:{{bg}};color:{{fg}};font-family:Inter,sans-serif;display:flex;">
  <div style="width:46%;background:linear-gradient(135deg,{{primary}},{{accent}});padding:40px 28px;color:#fff;display:flex;flex-direction:column;justify-content:space-between;">
    <div>
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:.85;font-weight:900;">{{bizName}}</div>
      <h1 style="margin-top:18px;font-size:28px;font-weight:900;">{{fullName}}</h1>
      <div style="opacity:.85;font-size:13px;margin-top:4px;">{{tagline}}</div>
    </div>
    <img src="{{qrUrl}}" style="width:90px;height:90px;background:#fff;border-radius:8px;padding:6px;" />
  </div>
  <div style="flex:1;padding:40px 32px;font-size:13px;">
    <div style="color:{{primary}};font-weight:900;text-transform:uppercase;letter-spacing:0.16em;font-size:11px;">Contact</div>
    <div style="margin-top:14px;line-height:2.1;">
      <div>📞 {{phone}}</div>
      <div>📧 {{email}}</div>
      <div>🌐 {{website}}</div>
      <div>📍 {{city}}</div>
    </div>
  </div>
</div>`;
  }
  // qr_poster
  return `
<div class="page" style="padding:60px;background:linear-gradient(135deg,{{primary}},{{accent}});color:#fff;font-family:Inter,sans-serif;text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;">
  <div style="font-size:14px;letter-spacing:0.32em;text-transform:uppercase;font-weight:900;opacity:.92;">{{bizName}}</div>
  <h1 style="margin-top:16px;font-size:54px;font-weight:900;letter-spacing:-0.02em;line-height:1.05;">{{fullName}}</h1>
  <div style="margin-top:8px;font-size:18px;opacity:.92;">{{tagline}}</div>
  <div style="margin-top:40px;background:#fff;border-radius:32px;padding:24px;">
    <img src="{{qrUrl}}" style="width:280px;height:280px;" />
  </div>
  <div style="margin-top:32px;font-size:18px;font-weight:800;">Scan to connect</div>
  <div style="margin-top:6px;font-size:14px;opacity:.85;">{{publicUrl}}</div>
</div>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function substitute(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function buildVars(ctx, template) {
  const p = ctx.profile || {};
  const exp = (p.experience || []).slice(0, 5).map((e) =>
    `<div style="margin-top:8px;"><strong>${esc(e.role || '')}</strong> · ${esc(e.company || '')}<br/><span style="color:${ctx.subtle};font-size:12px;">${esc(e.startDate || '')} - ${esc(e.endDate || 'Present')}</span></div>`).join('');
  const edu = (p.education || []).slice(0, 4).map((e) =>
    `<div style="margin-top:8px;"><strong>${esc(e.degree || '')}</strong> · ${esc(e.institution || '')}<br/><span style="color:${ctx.subtle};font-size:12px;">${esc(e.startYear || '')} - ${esc(e.endYear || '')}</span></div>`).join('');
  const social = (p.social || []).slice(0, 6).map((s) =>
    `<div style="margin-top:6px;font-size:13px;">${esc(s.platform || 'Link')} · ${esc(s.url || '')}</div>`).join('');

  return {
    fullName: esc(p.fullName || 'Your name'),
    tagline: esc(p.tagline || ''),
    bio: esc(p.bio || ''),
    email: esc(p.email || ''),
    phone: esc(p.phone || ''),
    website: esc(p.website || ''),
    city: esc([p.city, p.country].filter(Boolean).join(', ')),
    bizName: esc(p.business?.name || ''),
    publicUrl: esc(ctx.publicUrl || ''),
    qrUrl: ctx.publicUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(ctx.publicUrl)}`
      : '',
    primary: ctx.primary,
    accent: ctx.accent,
    bg: ctx.bg,
    fg: ctx.fg,
    subtle: ctx.subtle,
    experienceList: exp,
    educationList: edu,
    socialList: social,
  };
}

async function renderHtml({ slug, ctx, theme }) {
  const tpl = await StudioTemplate.findBySlug(slug);
  if (!tpl) throw new Error('Template not found');
  if (!tpl.is_published) throw new Error('Template not published');

  const bg = PALETTE_BG[theme === 'dark' ? 'dark' : 'light'];
  const fg = theme === 'dark' ? '#f7f5ff' : '#1a1138';
  const subtle = theme === 'dark' ? '#aaa3c7' : '#5b5380';

  const renderCtx = {
    ...ctx,
    primary: ctx.primary || tpl.primary_color,
    accent: ctx.accent || tpl.accent_color,
    bg, fg, subtle,
  };

  const body = substitute(tpl.html_template || defaultHtmlForCategory(tpl.category), buildVars(renderCtx, tpl));

  const html = `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  body { margin:0; padding:0; background:${bg}; }
  .page { width:${tpl.width}px; height:${tpl.height}px; box-sizing:border-box; overflow:hidden; }
</style>
</head><body>${body}</body></html>`;

  return { html, tpl };
}

async function renderTemplate({ slug, ctx, theme, format }) {
  const { html, tpl } = await renderHtml({ slug, ctx, theme });

  if (format === 'svg') {
    // Cheap SVG-wrap of the HTML via foreignObject — works for previews & static
    // sharing. Not as pixel-perfect as raster but no Chromium required.
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${tpl.width}" height="${tpl.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
  </foreignObject>
</svg>`;
    return { buffer: Buffer.from(svg, 'utf8'), contentType: 'image/svg+xml', extension: 'svg', tpl };
  }

  const puppeteer = require('puppeteer-core');
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    detectLocalChrome();
  if (!executablePath) {
    const err = new Error('No Chromium executable found.');
    err.code = 'NO_CHROMIUM';
    throw err;
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: tpl.width, height: tpl.height, deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 25_000 });

    if (format === 'png') {
      const png = await page.screenshot({ type: 'png', fullPage: false });
      return { buffer: png, contentType: 'image/png', extension: 'png', tpl };
    }

    // default → pdf
    const pdf = await page.pdf({
      width: `${tpl.width}px`,
      height: `${tpl.height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return { buffer: pdf, contentType: 'application/pdf', extension: 'pdf', tpl };
  } finally {
    await browser.close().catch(() => {});
  }
}

function detectLocalChrome() {
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

module.exports = { renderTemplate, renderHtml, defaultHtmlForCategory };
