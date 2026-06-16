/**
 * Server-side renderer for the Digital Card.
 *
 * Returns a self-contained HTML string for any of the templates below, themed
 * by the user's chosen primary/accent colours. Used by CardPDFService to produce
 * a PDF via puppeteer-core.
 */

const TEMPLATES = [
  {
    id: 'gradient-classic',
    name: 'Gradient Classic',
    description: 'Bold gradient header with rounded info card.',
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Single-colour, lots of whitespace, magazine-clean.',
  },
  {
    id: 'split-modern',
    name: 'Split Modern',
    description: 'Two-column split — photo left, details right.',
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'Dark background, neon accents, futuristic.',
  },
  {
    id: 'corporate-premium',
    name: 'Corporate Premium',
    description: 'Subtle gradient, gold accents, executive.',
  },
  {
    id: 'playful-rounded',
    name: 'Playful Rounded',
    description: 'Soft shapes, candy colours, friendly.',
  },
];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeColor(c, fallback) {
  if (typeof c !== 'string') return fallback;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim())) return fallback;
  return c.trim();
}

/**
 * @param {object} ctx
 * @param {string} ctx.templateId
 * @param {string} ctx.primary  hex
 * @param {string} ctx.accent   hex
 * @param {string} ctx.theme    'light' | 'dark'
 * @param {object} ctx.profile  flat: { fullName, tagline, bio, email, phone, whatsapp,
 *                                       website, city, country, picture, social[],
 *                                       business{name,category} }
 * @param {string} ctx.publicUrl
 */
function renderCardHtml(ctx) {
  const primary = safeColor(ctx.primary, '#6E2BFF');
  const accent = safeColor(ctx.accent, '#FF4D8D');
  const theme = ctx.theme === 'dark' ? 'dark' : 'light';
  const p = ctx.profile || {};
  const templateId = TEMPLATES.find((t) => t.id === ctx.templateId)?.id || 'gradient-classic';

  const fullName = esc(p.fullName || 'Your name');
  const tagline = esc(p.tagline || '');
  const bio = esc(p.bio || '');
  const email = esc(p.email || '');
  const phone = esc(p.phone || '');
  const whatsapp = esc(p.whatsapp || '');
  const website = esc(p.website || '');
  const city = esc(p.city || '');
  const country = esc(p.country || '');
  const picture = esc(p.picture || '');
  const bizName = esc(p.business?.name || '');
  const bizCat = esc(p.business?.category || '');
  const social = Array.isArray(p.social) ? p.social : [];
  const url = esc(ctx.publicUrl || '');

  const bg = theme === 'dark' ? '#0b0820' : '#ffffff';
  const fg = theme === 'dark' ? '#f7f5ff' : '#1a1138';
  const subtle = theme === 'dark' ? '#aaa3c7' : '#5b5380';
  const surface = theme === 'dark' ? '#15102e' : '#f7f4ff';

  const initials = (p.fullName || 'Y').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || 'Y';
  const avatar = picture
    ? `<img src="${picture}" alt="" />`
    : `<span style="font-size:48px;font-weight:900;color:${primary}">${initials}</span>`;

  const baseStyles = `
    <style>
      *,*::before,*::after { box-sizing: border-box; }
      body { margin: 0; padding: 0; background: ${bg}; color: ${fg};
             font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
             -webkit-font-smoothing: antialiased; }
      .card { width: 600px; min-height: 850px; margin: 40px auto; padding: 40px;
              background: ${bg}; border-radius: 32px;
              box-shadow: 0 30px 60px -20px rgba(20,10,60,0.15); position: relative; overflow: hidden; }
      .avatar { width: 120px; height: 120px; border-radius: 50%; overflow: hidden;
                background: ${surface}; display:flex; align-items:center; justify-content:center;
                border: 4px solid ${bg}; }
      .avatar img { width: 100%; height: 100%; object-fit: cover; }
      h1 { font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
      .tagline { color: ${primary}; font-weight: 800; font-size: 14px;
                 text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
      .bio { color: ${subtle}; font-size: 14px; line-height: 1.6; margin-top: 12px; }
      .row { display:flex; align-items:center; gap: 10px; padding: 10px 14px;
             background: ${surface}; border-radius: 14px; margin-top: 8px;
             font-size: 13px; font-weight: 600; }
      .row .dot { width:8px; height:8px; border-radius:50%; background: ${accent}; flex-shrink:0; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
      .qr { width:96px;height:96px;background:#fff;border-radius:12px; padding:6px; }
      footer { margin-top: 28px; color: ${subtle}; font-size: 11px; text-align:center; }
    </style>
  `;

  const contactRows = [
    phone && `<div class="row"><span class="dot"></span>Call ${phone}</div>`,
    whatsapp && `<div class="row"><span class="dot"></span>WhatsApp ${whatsapp}</div>`,
    email && `<div class="row"><span class="dot"></span>Email ${email}</div>`,
    website && `<div class="row"><span class="dot"></span>Web ${website}</div>`,
    (city || country) && `<div class="row"><span class="dot"></span>${[city, country].filter(Boolean).join(', ')}</div>`,
  ].filter(Boolean).join('');

  const socialRows = social
    .filter((s) => s && s.url)
    .map((s) => `<div class="row"><span class="dot"></span>${esc(s.platform || 'Link')} · ${esc(s.url)}</div>`)
    .join('');

  // QR via free service so we don't add another dep
  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}` : '';

  const templates = {
    'gradient-classic': () => `
      <div class="card">
        <div style="height:140px;border-radius:24px;background:linear-gradient(135deg,${primary} 0%,${accent} 100%);margin:-20px -20px 0 -20px;position:relative;"></div>
        <div style="display:flex;justify-content:center;margin-top:-60px;">${`<div class="avatar">${avatar}</div>`}</div>
        <div style="text-align:center;margin-top:14px;">
          <h1>${fullName}</h1>
          ${tagline ? `<div class="tagline">${tagline}</div>` : ''}
          ${bio ? `<div class="bio">${bio}</div>` : ''}
        </div>
        <div style="margin-top:24px;">${contactRows}</div>
        ${socialRows ? `<div style="margin-top:16px;"><h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${subtle};margin:0 0 8px 0;">Links</h3>${socialRows}</div>` : ''}
        ${qrSrc ? `<div style="display:flex;justify-content:center;margin-top:24px;"><img class="qr" src="${qrSrc}" /></div>` : ''}
        <footer>${url || 'clickcard.app'}</footer>
      </div>`,

    'minimal-mono': () => `
      <div class="card" style="padding:60px 50px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${primary};font-weight:900;">${bizName || 'Digital Card'}</div>
            <h1 style="margin-top:18px;font-size:42px;">${fullName}</h1>
            ${tagline ? `<div style="color:${subtle};font-size:16px;margin-top:6px;">${tagline}</div>` : ''}
          </div>
          <div class="avatar" style="width:90px;height:90px;">${avatar}</div>
        </div>
        <div style="height:2px;background:${primary};margin:32px 0;width:60px;"></div>
        ${bio ? `<div class="bio" style="font-size:15px;">${bio}</div>` : ''}
        <div style="margin-top:32px;">${contactRows}</div>
        ${socialRows ? `<div style="margin-top:16px;">${socialRows}</div>` : ''}
        ${qrSrc ? `<div style="display:flex;justify-content:flex-end;margin-top:24px;"><img class="qr" src="${qrSrc}" /></div>` : ''}
        <footer>${url || 'clickcard.app'}</footer>
      </div>`,

    'split-modern': () => `
      <div class="card" style="padding:0;display:flex;min-height:850px;">
        <div style="width:240px;background:linear-gradient(180deg,${primary},${accent});padding:32px 24px;color:#fff;display:flex;flex-direction:column;align-items:center;">
          <div class="avatar" style="border-color:rgba(255,255,255,0.4);">${avatar}</div>
          <h1 style="color:#fff;text-align:center;margin-top:16px;font-size:22px;">${fullName}</h1>
          ${tagline ? `<div style="color:rgba(255,255,255,0.9);text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;font-weight:800;">${tagline}</div>` : ''}
          ${qrSrc ? `<img class="qr" src="${qrSrc}" style="margin-top:auto;background:#fff;" />` : ''}
        </div>
        <div style="flex:1;padding:36px;">
          ${bizName ? `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:${primary};font-weight:900;">${bizName}${bizCat ? ' · ' + bizCat : ''}</div>` : ''}
          ${bio ? `<div class="bio" style="margin-top:14px;">${bio}</div>` : ''}
          <div style="margin-top:20px;">${contactRows}</div>
          ${socialRows ? `<div style="margin-top:16px;">${socialRows}</div>` : ''}
        </div>
      </div>`,

    'neon-dark': () => `
      <div class="card" style="background:#08051a;color:#e8e3ff;border:1px solid rgba(255,255,255,0.08);">
        <div style="height:160px;border-radius:24px;margin:-20px -20px 0;background:radial-gradient(circle at 30% 30%,${primary}99,transparent 60%),radial-gradient(circle at 70% 70%,${accent}99,transparent 60%),#08051a;position:relative;"></div>
        <div style="display:flex;justify-content:center;margin-top:-60px;">${`<div class="avatar" style="border-color:#08051a;background:#15102e;">${avatar}</div>`}</div>
        <div style="text-align:center;margin-top:14px;">
          <h1 style="color:#fff;">${fullName}</h1>
          ${tagline ? `<div style="color:${accent};font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.12em;margin-top:6px;">${tagline}</div>` : ''}
          ${bio ? `<div style="color:#aaa3c7;font-size:14px;line-height:1.6;margin-top:12px;">${bio}</div>` : ''}
        </div>
        <div style="margin-top:24px;">${contactRows.replace(/background:[^;]+;/g, 'background:rgba(255,255,255,0.06);')}</div>
        ${socialRows ? `<div style="margin-top:16px;">${socialRows.replace(/background:[^;]+;/g, 'background:rgba(255,255,255,0.06);')}</div>` : ''}
        ${qrSrc ? `<div style="display:flex;justify-content:center;margin-top:24px;"><img class="qr" src="${qrSrc}" /></div>` : ''}
        <footer style="color:#aaa3c7;">${url || 'clickcard.app'}</footer>
      </div>`,

    'corporate-premium': () => `
      <div class="card" style="background:#fcfbf7;color:#1f1a36;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;border-bottom:2px solid ${primary};">
          <div>
            ${bizName ? `<div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${primary};font-weight:900;">${bizName}</div>` : ''}
            <h1 style="margin-top:8px;font-family:Georgia,serif;font-weight:700;letter-spacing:0;">${fullName}</h1>
            ${tagline ? `<div style="color:${subtle};font-style:italic;margin-top:6px;">${tagline}</div>` : ''}
          </div>
          <div class="avatar">${avatar}</div>
        </div>
        ${bio ? `<div class="bio" style="margin-top:24px;font-style:italic;">${bio}</div>` : ''}
        <div style="margin-top:28px;">${contactRows}</div>
        ${socialRows ? `<div style="margin-top:16px;">${socialRows}</div>` : ''}
        ${qrSrc ? `<div style="display:flex;justify-content:flex-end;margin-top:24px;"><img class="qr" src="${qrSrc}" /></div>` : ''}
        <footer>${url || 'clickcard.app'}</footer>
      </div>`,

    'playful-rounded': () => `
      <div class="card" style="background:linear-gradient(135deg,#fff7fb,#f3eeff);">
        <div style="background:#fff;border-radius:24px;padding:24px;box-shadow:0 12px 30px -10px rgba(60,40,150,0.12);">
          <div style="display:flex;gap:18px;align-items:center;">
            <div class="avatar" style="border-color:transparent;">${avatar}</div>
            <div>
              <h1 style="font-size:26px;">${fullName}</h1>
              ${tagline ? `<div style="color:${accent};font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px;">${tagline}</div>` : ''}
            </div>
          </div>
          ${bio ? `<div class="bio" style="margin-top:14px;">${bio}</div>` : ''}
        </div>
        <div style="margin-top:18px;">${contactRows}</div>
        ${socialRows ? `<div style="margin-top:14px;">${socialRows}</div>` : ''}
        ${qrSrc ? `<div style="display:flex;justify-content:center;margin-top:24px;"><img class="qr" src="${qrSrc}" /></div>` : ''}
        <footer>${url || 'clickcard.app'}</footer>
      </div>`,
  };

  const html = (templates[templateId] || templates['gradient-classic'])();

  return `<!doctype html>
<html><head><meta charset="utf-8" />${baseStyles}</head><body>${html}</body></html>`;
}

module.exports = {
  TEMPLATES,
  renderCardHtml,
};
