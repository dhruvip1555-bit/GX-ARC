const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/** Escape user input before inserting into HTML */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip characters that could inject SMTP headers */
function sanitizeHeader(str) {
  return String(str).replace(/[\r\n\t]/g, '').substring(0, 200);
}

async function sendFormEmail({ subject, personName, contactNumber, email, companyName, query, notify }) {
  const safeSubject     = sanitizeHeader(subject);
  const safeName        = sanitizeHeader(personName);
  const safeEmail       = sanitizeHeader(email);

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; color: #1a1a1a;">
      <h2 style="margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid #111; padding-bottom: 10px;">
        ${escapeHtml(safeSubject)}
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:8px 12px; color:#666; width:140px;">Name</td><td style="padding:8px 12px;">${escapeHtml(safeName)}</td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Contact</td><td style="padding:8px 12px;">${escapeHtml(contactNumber)}</td></tr>
        <tr><td style="padding:8px 12px; color:#666;">Email</td><td style="padding:8px 12px;">${escapeHtml(safeEmail)}</td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Company</td><td style="padding:8px 12px;">${escapeHtml(companyName || '—')}</td></tr>
        <tr><td style="padding:8px 12px; color:#666; vertical-align:top;">Message</td><td style="padding:8px 12px; white-space:pre-wrap;">${escapeHtml(query)}</td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Notify by email</td><td style="padding:8px 12px;">${notify ? 'Yes' : 'No'}</td></tr>
      </table>
      <p style="margin-top:24px; font-size:12px; color:#999;">Sent from the GX-Arc website contact form.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"GX-Arc Website" <${process.env.SMTP_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    replyTo: safeEmail,
    subject: `[GX-Arc] ${safeSubject} — ${safeName}`,
    html: htmlBody,
  });
}

module.exports = { sendFormEmail };
