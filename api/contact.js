/* POST /api/contact — sends the contact form via Resend to CONTACT_EMAIL.
   Vercel serverless function, zero dependencies (uses the platform's
   built-in fetch to talk to the Resend REST API). */

const { sendEmail, escapeHtml } = require('./_lib/send');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const company = (body.company || '').trim();
    const budget = (body.budget || '').trim();
    const service = (body.service || '').trim();
    const message = (body.message || '').trim();

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Naam, e-mail en bericht zijn verplicht.' });
      return;
    }

    const contactEmail = process.env.CONTACT_EMAIL;
    if (!contactEmail) {
      res.status(500).json({ error: 'CONTACT_EMAIL is niet ingesteld.' });
      return;
    }

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif; max-width:600px; margin:0 auto; color:#0E0E12; line-height:1.6;">
        <h2 style="margin:0 0 1em;">Nieuw bericht via het contactformulier</h2>
        <p style="margin:0 0 .6em;"><strong>Naam:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 .6em;"><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 .6em;"><strong>Bedrijf:</strong> ${escapeHtml(company) || '-'}</p>
        <p style="margin:0 0 .6em;"><strong>Indicatief budget:</strong> ${escapeHtml(budget) || '-'}</p>
        <p style="margin:0 0 .6em;"><strong>Interesse in:</strong> ${escapeHtml(service) || '-'}</p>
        <p style="margin:1.2em 0 .3em;"><strong>Bericht:</strong></p>
        <p style="margin:0; white-space:pre-line;">${escapeHtml(message)}</p>
      </div>
    `;

    await sendEmail({
      to: contactEmail,
      replyTo: email,
      subject: `Nieuw contactformulier — ${name}`,
      html
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('api/contact error', err);
    res.status(500).json({ error: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.' });
  }
};
