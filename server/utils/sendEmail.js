const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null; // Email not configured — callers should no-op gracefully.
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    console.warn(`Email not sent (EMAIL_USER/EMAIL_PASSWORD not set). Would have sent "${subject}" to ${to}.`);
    return { skipped: true };
  }

  return t.sendMail({
    from: process.env.EMAIL_FROM || `"WriteMate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

module.exports = { sendEmail };
