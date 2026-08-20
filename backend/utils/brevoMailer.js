// backend/utils/brevoMailer.js
//
// Thin wrapper around the Brevo (Sendinblue) transactional email API.
// Requires BREVO_API_KEY in your environment.
//
// Docs: https://developers.brevo.com/reference/sendtransacemail

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'BSIE Community',
  email: process.env.BREVO_SENDER_EMAIL, // must be a verified sender in Brevo
};

async function sendOtpEmail(toEmail, code) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured.');
  }
  if (!SENDER.email) {
    throw new Error('BREVO_SENDER_EMAIL is not configured.');
  }

  const payload = {
    sender: SENDER,
    to: [{ email: toEmail }],
    subject: 'Your UTB Community verification code',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; background:#07100f; color:#eefdf7; padding:24px;">
        <p style="color:#8dffca; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">&gt; auth.utb()</p>
        <h2 style="margin:8px 0 16px;">University Identity Terminal</h2>
        <p style="color:#b7ccc6; font-size:14px;">Your one-time verification code is:</p>
        <p style="font-size:32px; font-weight:800; letter-spacing:.15em; color:#8dffca; margin:16px 0;">${code}</p>
        <p style="color:#8ca9a1; font-size:12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Brevo request failed (${response.status}): ${text}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

module.exports = { sendOtpEmail };