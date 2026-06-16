const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const https = require('https');

// Color palette
const COLORS = {
  primary: '#1a237e',    // Deep navy blue
  accent: '#3949ab',     // Medium blue
  text: '#212121',       // Near black
  subtext: '#616161',    // Medium grey
  light: '#e8eaf6',      // Light lavender
  white: '#ffffff',
  divider: '#c5cae9',
};

const FONTS = {
  normal: 'Helvetica',
  bold: 'Helvetica-Bold',
  oblique: 'Helvetica-Oblique',
};

const PDFService = {
  /**
   * Helper to fetch image buffer from URL
   */
  fetchImage: (url) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', (err) => reject(err));
      }).on('error', (err) => reject(err));
    });
  },

  /**
   * Fetch full user data + profile for PDF generation
   */
  fetchUserData: async (userId) => {
    const userQuery = `
      SELECT id, email, first_name, last_name, phone_number, profile_picture,
             profile_bio, public_profile_enabled, is_email_verified
      FROM users WHERE id = $1
    `;
    const profileQuery = `
      SELECT * FROM user_profiles WHERE user_id = $1
    `;

    const [userResult, profileResult] = await Promise.all([
      pool.query(userQuery, [userId]),
      pool.query(profileQuery, [userId]),
    ]);

    const user = userResult.rows[0];
    const profile = profileResult.rows[0] || {};

    return { user, profile };
  },

  /**
   * Main PDF generation function — streams to response
   */
  generateResumePDF: async (userId, res) => {
    const { user, profile } = await PDFService.fetchUserData(userId);

    if (!user) throw new Error('User not found');

    // Parse JSONB fields safely
    const personalIdentity = PDFService.safeJSON(profile.personal_identity, {});
    const contactInfo = PDFService.safeJSON(profile.contact_information, {});
    const education = PDFService.safeJSON(profile.education, []);
    const workExperience = PDFService.safeJSON(profile.work_experience, []);
    const businessDetails = PDFService.safeJSON(profile.business_details, {});
    const productsServices = PDFService.safeJSON(profile.products_services, []);
    const socialLinks = PDFService.safeJSON(profile.social_links, {});

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ClickCard User';
    const headline = personalIdentity.headline || businessDetails.job_title || businessDetails.role || '';

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 0, bottom: 40, left: 0, right: 0 },
      info: {
        Title: `${fullName} — Resume`,
        Author: 'ClickCard',
        Subject: 'Professional Resume',
      },
    });

    // Stream to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fullName.replace(/\s+/g, '_')}_Resume.pdf"`);
    doc.pipe(res);

    // ── HEADER SECTION ──────────────────────────────────────────────
    // Background header block
    doc.rect(0, 0, doc.page.width, 170).fill(COLORS.primary);

    // Profile Picture (Circular)
    if (user.profile_picture) {
      try {
        const imageBuffer = await PDFService.fetchImage(user.profile_picture);
        doc.save();
        doc.circle(doc.page.width - 80, 80, 50).clip();
        doc.image(imageBuffer, doc.page.width - 130, 30, { width: 100 });
        doc.restore();
        
        // Circular Border
        doc.circle(doc.page.width - 80, 80, 50).lineWidth(2).strokeColor(COLORS.light).stroke();
      } catch (err) {
        console.error('Failed to include profile picture in PDF:', err.message);
      }
    }

    // Name
    doc.font(FONTS.bold)
      .fontSize(26)
      .fillColor(COLORS.white)
      .text(fullName, 40, 40, { lineBreak: false });

    // Headline / Job Title
    if (headline) {
      doc.moveDown(0.4)
        .font(FONTS.oblique)
        .fontSize(13)
        .fillColor(COLORS.light)
        .text(headline, 40, 78, { width: doc.page.width - 200 });
    }

    // Contact row in header
    const contactItems = [];
    if (user.email) contactItems.push(`✉ ${user.email}`);
    if (user.phone_number || contactInfo.phone) contactItems.push(`✆ ${user.phone_number || contactInfo.phone}`);
    if (contactInfo.website) contactItems.push(`🌐 ${contactInfo.website}`);
    if (contactInfo.location) contactItems.push(`📍 ${contactInfo.location}`);

    if (contactItems.length > 0) {
      doc.font(FONTS.normal)
        .fontSize(9)
        .fillColor(COLORS.light)
        .text(contactItems.join('   |   '), 40, 125, { width: doc.page.width - 160 });
    }

    // Accent bar
    doc.rect(0, 170, doc.page.width, 6).fill(COLORS.accent);

    let yPos = 196;

    // ── BIO / ABOUT ─────────────────────────────────────────────────
    const bio = user.profile_bio || personalIdentity.bio || personalIdentity.about || '';
    if (bio) {
      yPos = PDFService.drawSection(doc, 'About Me', yPos);
      doc.font(FONTS.normal).fontSize(10).fillColor(COLORS.text)
        .text(bio, 40, yPos, { width: doc.page.width - 80, align: 'justify' });
      yPos = doc.y + 16;
    }

    // ── WORK EXPERIENCE ─────────────────────────────────────────────
    if (workExperience.length > 0) {
      yPos = PDFService.drawSection(doc, 'Work Experience', yPos);

      for (const job of workExperience) {
        const title = job.title || job.role || job.position || '';
        const company = job.company || job.organization || '';
        const duration = PDFService.formatDuration(job.start_date || job.startDate, job.end_date || job.endDate || job.is_current ? 'Present' : '');
        const description = job.description || job.responsibilities || '';

        // Job title + company
        doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.accent)
          .text(title, 40, yPos);
        yPos = doc.y;

        doc.font(FONTS.normal).fontSize(10).fillColor(COLORS.subtext)
          .text(`${company}${duration ? '  •  ' + duration : ''}`, 40, yPos);
        yPos = doc.y + 2;

        if (description) {
          doc.font(FONTS.normal).fontSize(9.5).fillColor(COLORS.text)
            .text(description, 40, yPos, { width: doc.page.width - 80 });
          yPos = doc.y + 4;
        }

        yPos += 8;
        PDFService.checkPageBreak(doc, yPos);
        yPos = PDFService.getYAfterCheck(doc, yPos);
      }
    }

    // ── EDUCATION ───────────────────────────────────────────────────
    if (education.length > 0) {
      yPos = PDFService.drawSection(doc, 'Education', yPos);

      for (const edu of education) {
        const degree = edu.degree || edu.qualification || '';
        const institution = edu.institution || edu.school || edu.university || '';
        const year = edu.year || edu.graduation_year || edu.end_year || '';
        const field = edu.field || edu.field_of_study || edu.major || '';

        doc.font(FONTS.bold).fontSize(11).fillColor(COLORS.accent)
          .text(`${degree}${field ? ' in ' + field : ''}`, 40, yPos);
        yPos = doc.y;

        doc.font(FONTS.normal).fontSize(10).fillColor(COLORS.subtext)
          .text(`${institution}${year ? '  •  ' + year : ''}`, 40, yPos);
        yPos = doc.y + 12;
      }
    }

    // ── BUSINESS DETAILS ────────────────────────────────────────────
    const hasBusinessDetails = Object.keys(businessDetails).length > 0 &&
      (businessDetails.company_name || businessDetails.industry || businessDetails.services);

    if (hasBusinessDetails) {
      yPos = PDFService.drawSection(doc, 'Business', yPos);

      const bizItems = [];
      if (businessDetails.company_name) bizItems.push(['Company', businessDetails.company_name]);
      if (businessDetails.industry) bizItems.push(['Industry', businessDetails.industry]);
      if (businessDetails.job_title || businessDetails.role) bizItems.push(['Role', businessDetails.job_title || businessDetails.role]);
      if (businessDetails.company_size) bizItems.push(['Team Size', businessDetails.company_size]);
      if (businessDetails.founded_year) bizItems.push(['Founded', businessDetails.founded_year]);

      for (const [label, value] of bizItems) {
        doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.text).text(`${label}: `, 40, yPos, { continued: true });
        doc.font(FONTS.normal).fontSize(10).fillColor(COLORS.subtext).text(value);
        yPos = doc.y + 2;
      }

      if (businessDetails.description) {
        yPos += 4;
        doc.font(FONTS.normal).fontSize(9.5).fillColor(COLORS.text)
          .text(businessDetails.description, 40, yPos, { width: doc.page.width - 80 });
        yPos = doc.y;
      }
      yPos += 8;
    }

    // ── PRODUCTS & SERVICES ─────────────────────────────────────────
    if (productsServices.length > 0) {
      yPos = PDFService.drawSection(doc, 'Products & Services', yPos);

      for (const item of productsServices) {
        const name = item.name || item.title || '';
        const desc = item.description || '';

        doc.font(FONTS.bold).fontSize(10.5).fillColor(COLORS.accent).text(`• ${name}`, 40, yPos);
        yPos = doc.y;

        if (desc) {
          doc.font(FONTS.normal).fontSize(9.5).fillColor(COLORS.text)
            .text(desc, 52, yPos, { width: doc.page.width - 92 });
          yPos = doc.y;
        }
        yPos += 6;
      }
    }

    // ── SOCIAL LINKS ────────────────────────────────────────────────
    const socialEntries = Object.entries(socialLinks).filter(([, val]) => val && val.trim());
    if (socialEntries.length > 0) {
      yPos = PDFService.drawSection(doc, 'Online Presence', yPos);

      const labels = {
        linkedin: 'LinkedIn', github: 'GitHub', twitter: 'Twitter / X',
        instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube',
        website: 'Website', portfolio: 'Portfolio', behance: 'Behance',
        dribbble: 'Dribbble',
      };

      for (const [key, value] of socialEntries) {
        const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
        doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.text).text(`${label}: `, 40, yPos, { continued: true });
        doc.font(FONTS.normal).fontSize(10).fillColor(COLORS.accent).text(value, { link: value.startsWith('http') ? value : `https://${value}` });
        yPos = doc.y + 3;
      }
    }

    // ── FOOTER ──────────────────────────────────────────────────────
    const footerY = doc.page.height - 35;
    doc.rect(0, footerY - 5, doc.page.width, 40).fill(COLORS.light);
    doc.font(FONTS.normal).fontSize(8).fillColor(COLORS.subtext)
      .text(
        `Generated by ClickCard  •  ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        40, footerY + 2,
        { align: 'center', width: doc.page.width - 80 }
      );

    doc.end();
  },

  // ── HELPERS ───────────────────────────────────────────────────────

  /**
   * Draw a styled section heading with divider
   */
  drawSection: (doc, title, yPos) => {
    // Check if we need a page break
    if (yPos > doc.page.height - 120) {
      doc.addPage();
      yPos = 40;
    }

    // Section title
    doc.font(FONTS.bold).fontSize(13).fillColor(COLORS.primary)
      .text(title.toUpperCase(), 40, yPos);
    yPos = doc.y + 2;

    // Underline
    doc.rect(40, yPos, doc.page.width - 80, 1.5).fill(COLORS.accent);
    yPos += 10;

    return yPos;
  },

  checkPageBreak: (doc, yPos) => {
    if (yPos > doc.page.height - 100) {
      doc.addPage();
    }
  },

  getYAfterCheck: (doc, yPos) => {
    if (yPos > doc.page.height - 100) return 50;
    return yPos;
  },

  safeJSON: (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  },

  formatDuration: (start, end) => {
    if (!start && !end) return '';
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return '';
  },
};

module.exports = PDFService;
