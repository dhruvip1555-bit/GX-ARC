const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                       // STARTTLS on 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a form-submission email to the team.
 *
 * @param {Object} opts
 * @param {string} opts.subject      - Email subject line
 * @param {string} opts.personName
 * @param {string} opts.contactNumber
 * @param {string} opts.email        - Submitter's email
 * @param {string} opts.companyName
 * @param {string} opts.query        - The message / question
 * @param {boolean} opts.notify      - Whether the viewer opted in for email updates
 */
async function sendFormEmail({ subject, personName, contactNumber, email, companyName, query, notify }) {
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; color: #1a1a1a;">
      <h2 style="margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid #111; padding-bottom: 10px;">
        ${subject}
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:8px 12px; color:#666; width:140px;">Name</td><td style="padding:8px 12px;">${personName}</td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Contact</td><td style="padding:8px 12px;">${contactNumber}</td></tr>
        <tr><td style="padding:8px 12px; color:#666;">Email</td><td style="padding:8px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Company</td><td style="padding:8px 12px;">${companyName || '—'}</td></tr>
        <tr><td style="padding:8px 12px; color:#666; vertical-align:top;">Message</td><td style="padding:8px 12px; white-space:pre-wrap;">${query}</td></tr>
        <tr style="background:#f8f8f7;"><td style="padding:8px 12px; color:#666;">Notify by email</td><td style="padding:8px 12px;">${notify ? 'Yes' : 'No'}</td></tr>
      </table>
      <p style="margin-top:24px; font-size:12px; color:#999;">Sent from the GX-Arc website contact form.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"GX-Arc Website" <${process.env.SMTP_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    replyTo: email,
    subject: `[GX-Arc] ${subject} — ${personName}`,
    html: htmlBody,
  });
}

module.exports = { sendFormEmail };
