/* POST /api/contact — sends the contact form via Resend:
     1. an internal notification to CONTACT_EMAIL with the submitted data
        (reply-to set to the visitor, so Jip can answer directly);
     2. a branded confirmation e-mail back to the visitor.
   Vercel serverless function, zero dependencies (uses the platform's
   built-in fetch to talk to the Resend REST API). */

const { sendEmail, escapeHtml } = require('./_lib/send');

function buildInternalEmail({ name, email, company, budget, service, message }) {
  return `
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
}

/* Zelfde huisstijl als de Boost Analyse-mail: donkere header/footer, crème
   body, lime/koraal gradient-CTA's. */
function buildConfirmationEmail({ name, casesUrl, plannenUrl }) {
  return `
<div style="margin:0; padding:0; background:#EBE6D8; font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 20px;">
    <div style="background:#0E0E12; border-radius:20px 20px 0 0; padding:28px 32px;">
      <span style="font-family:Georgia, 'Times New Roman', serif; font-weight:bold; font-size:20px; color:#F6F3EC; letter-spacing:-0.5px;">Boost<span style="color:#FF5A3C;">Lab</span></span>
    </div>
    <div style="background:#F6F3EC; padding:36px 32px;">
      <p style="font-size:16px; color:#0E0E12; margin:0 0 18px;">Hoi ${escapeHtml(name)},</p>
      <p style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 20px;">Bedankt voor je bericht! We hebben je aanvraag in goede orde ontvangen en nemen zo snel mogelijk contact met je op.</p>
      <p style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 32px;">BoostLab is het groei-laboratorium van Jip: een eenmansstudio uit Tilburg voor branding, websites, identiteit en grafisch ontwerp. Rechtstreeks contact, korte lijnen, geen tussenpersonen.</p>

      <div style="background:#0E0E12; border-radius:16px; padding:26px 24px; text-align:center; margin-bottom:16px;">
        <p style="font-size:16px; font-weight:bold; color:#F6F3EC; margin:0 0 16px;">Alvast een indruk?</p>
        <a href="${casesUrl}" style="display:inline-block; background:#CCFF66; color:#0E0E12; text-decoration:none; font-size:14px; font-weight:bold; padding:12px 26px; border-radius:100px;">Bekijk onze cases</a>
      </div>

      <div style="background:linear-gradient(135deg,#CCFF66,#FF5A3C); background-color:#CCFF66; border-radius:16px; padding:26px 24px; text-align:center;">
        <p style="font-size:16px; font-weight:bold; color:#0E0E12; margin:0 0 16px;">Liever meteen praten?</p>
        <a href="${plannenUrl}" style="display:inline-block; background:#0E0E12; color:#F6F3EC; text-decoration:none; font-size:14px; font-weight:bold; padding:12px 26px; border-radius:100px;">Plan een kennismaking</a>
      </div>
    </div>
    <div style="background:#0E0E12; border-radius:0 0 20px 20px; padding:22px 32px; text-align:center;">
      <p style="font-size:12px; color:#9C9AA0; margin:0 0 4px;">Boost Lab Agency — Tilburg</p>
      <p style="font-size:12px; color:#9C9AA0; margin:0;">jip@boostlab-agency.nl · +31 6 42 82 29 66</p>
    </div>
  </div>
</div>`;
}

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

    await sendEmail({
      to: contactEmail,
      replyTo: email,
      subject: `Nieuw contactformulier — ${name}`,
      html: buildInternalEmail({ name, email, company, budget, service, message })
    });

    let confirmationSent = true;
    try {
      await sendEmail({
        to: email,
        subject: 'Bedankt voor je bericht | BoostLab',
        html: buildConfirmationEmail({
          name,
          casesUrl: 'https://boostlab-agency.nl/cases.html',
          plannenUrl: 'https://boostlab-agency.nl/contact.html#plannen'
        })
      });
    } catch (confirmErr) {
      /* De interne mail (de lead) is al binnen — een mislukte bevestiging
         mag de aanvraag zelf niet laten falen, maar wel gelogd worden. */
      confirmationSent = false;
      console.error('api/contact — bevestigingsmail aan bezoeker mislukt', confirmErr);
    }

    res.status(200).json({ ok: true, confirmationSent });
  } catch (err) {
    console.error('api/contact error', err);
    res.status(500).json({ error: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.' });
  }
};
