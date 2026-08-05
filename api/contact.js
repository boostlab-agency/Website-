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

/* Premium bureau-uitstraling: echt logo (geen tekstlogo), veel witruimte,
   duidelijke typografische hiërarchie, subtiele kaart-CTA's in plaats van
   volle kleurvlakken. */
function buildConfirmationEmail({ name, casesUrl, plannenUrl }) {
  return `
<div style="margin:0; padding:0; background:#EBE6D8; font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">

    <div style="background:#0E0E12; border-radius:24px 24px 0 0; padding:36px 40px;">
      <img src="https://boostlab-agency.nl/assets/img/logo-lime.png" width="160" height="23" alt="BoostLab" style="display:block; width:160px; height:auto; max-width:160px; border:0; outline:none;">
    </div>

    <div style="background:#F6F3EC; padding:48px 40px;">
      <p style="font-size:16px; color:#0E0E12; margin:0 0 26px; line-height:1.6;">Hoi ${escapeHtml(name)},</p>

      <p style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-weight:bold; color:#0E0E12; margin:0 0 22px; line-height:1.3;">Bedankt voor je bericht.</p>

      <p style="font-size:15px; line-height:1.75; color:#3A3A40; margin:0 0 26px;">We hebben je aanvraag goed ontvangen en nemen zo snel mogelijk contact met je op.</p>

      <p style="font-size:15px; line-height:1.75; color:#3A3A40; margin:0 0 24px;">Bij BoostLab helpen we organisaties met sterke merken, slimme websites en digitale oplossingen die daadwerkelijk bijdragen aan groei.</p>

      <p style="font-size:15px; line-height:1.75; color:#3A3A40; margin:0 0 24px;">Wij geloven dat een merk meer is dan een logo, en dat een website meer moet doen dan alleen online aanwezig zijn. Daarom combineren we strategie, creativiteit en technologie om bedrijven zichtbaar, herkenbaar en toekomstbestendig te maken.</p>

      <p style="font-size:15px; line-height:1.75; color:#3A3A40; margin:0 0 44px;">In de tussentijd kun je alvast een kijkje nemen bij recente projecten en samenwerkingen.</p>

      <div style="height:1px; background:#E0DACB; margin:0 0 40px;"></div>

      <div style="background:#FFFFFF; border:1px solid #E5E0D2; border-radius:16px; padding:30px 32px; margin-bottom:20px;">
        <p style="font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#8A8F5E; font-weight:bold; margin:0 0 12px;">Portfolio</p>
        <p style="font-size:18px; font-weight:bold; color:#0E0E12; margin:0 0 12px;">Benieuwd naar ons werk?</p>
        <p style="font-size:14px; line-height:1.65; color:#5A5850; margin:0 0 24px;">Bekijk een selectie van projecten op het gebied van branding, websites, presentaties, verpakkingen en digitale oplossingen.</p>
        <a href="${casesUrl}" style="display:inline-block; background:#0E0E12; color:#CCFF66; text-decoration:none; font-size:13px; font-weight:bold; padding:13px 26px; border-radius:100px;">Bekijk onze cases</a>
      </div>

      <div style="background:#FFFFFF; border:1px solid #E5E0D2; border-radius:16px; padding:30px 32px;">
        <p style="font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#C15A3C; font-weight:bold; margin:0 0 12px;">Kennismaking</p>
        <p style="font-size:18px; font-weight:bold; color:#0E0E12; margin:0 0 12px;">Liever direct kennismaken?</p>
        <p style="font-size:14px; line-height:1.65; color:#5A5850; margin:0 0 24px;">Plan vrijblijvend een gesprek en ontdek waar de grootste kansen liggen voor jouw merk, website of organisatie.</p>
        <a href="${plannenUrl}" style="display:inline-block; background:#0E0E12; color:#F6F3EC; text-decoration:none; font-size:13px; font-weight:bold; padding:13px 26px; border-radius:100px;">Plan een kennismaking</a>
      </div>

      <div style="margin-top:48px;">
        <p style="font-size:14px; color:#5A5850; margin:0 0 20px;">Met vriendelijke groet,</p>
        <p style="font-size:15px; font-weight:bold; color:#0E0E12; margin:0 0 2px;">Jip Sanders van Well</p>
        <p style="font-size:14px; color:#5A5850; margin:0 0 12px;">BoostLab</p>
        <p style="font-size:11px; letter-spacing:.6px; text-transform:uppercase; color:#8A8F5E; font-weight:bold; margin:0;">Branding &middot; Websites &middot; AI &amp; Automatisering</p>
      </div>
    </div>

    <div style="background:#0E0E12; border-radius:0 0 24px 24px; padding:26px 40px;">
      <p style="font-size:12px; color:#8B8A85; margin:0 0 4px;">Boost Lab Agency — Tilburg</p>
      <p style="font-size:12px; color:#8B8A85; margin:0;">jip@boostlab-agency.nl · +31 6 42 82 29 66</p>
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
