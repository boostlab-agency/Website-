/* Shared Resend helper for the /api serverless functions.
   Filename starts with an underscore so Vercel does not turn it into its
   own route — it's only ever imported by the other functions in /api. */

async function sendEmail({ to, subject, html, replyTo, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey) throw new Error('RESEND_API_KEY ontbreekt in de environment variables.');
  if (!from) throw new Error('FROM_EMAIL ontbreekt in de environment variables.');

  const payload = {
    from: `BoostLab <${from}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html
  };
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Resend API-fout (${response.status}): ${errText}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

module.exports = { sendEmail, escapeHtml };
