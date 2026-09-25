/* POST /api/boost-check — after a completed Boost Check, sends two e-mails
   via Resend:
     1. an internal notification to CONTACT_EMAIL with all submitted data,
        the answers and the score;
     2. an extensive HTML "Boost Analyse" to the visitor's own e-mail.

   The score bands mirror assets/js/boost-check.js (client-side, used for
   the instant on-page result) — keep both in sync if the copy changes. */

const { sendEmail, escapeHtml } = require('./_lib/send');

const BANDS = [
  {
    max: 13,
    title: 'Fundament mist kracht',
    intro: 'Dat klinkt zwaarder dan het is: het betekent vooral dat de basis van je merk, website en marketing nog niet op elkaar is afgestemd, niet dat je iets verkeerd doet.',
    strengths: ['Je hebt een werkend bedrijf met een eigen aanpak', 'Je bent bereid kritisch naar je merk te kijken', 'Er liggen nog volop onbenutte kansen'],
    improvements: ['Een merk dat nog niet consistent overkomt', 'Een website die weinig voor je werkt', 'Weinig automatisering in je marketing'],
    advice: ['Sterkere merkidentiteit', 'Meer zichtbaarheid', 'Betere website', 'Slimmere processen'],
    why: 'Hoe langer merk, website en marketing los van elkaar blijven functioneren, hoe meer kansen je structureel laat liggen aan concurrenten die dat wél op orde hebben.',
    how: 'Ik begin bij de basis: een heldere merkidentiteit en een website die daadwerkelijk werkt, zodat elke volgende stap daarop kan voortbouwen.'
  },
  {
    max: 20,
    title: 'Groeipotentie aanwezig',
    intro: 'De basis staat, maar verschillende onderdelen van je merk, website en marketing versterken elkaar nog onvoldoende.',
    strengths: ['Een merk dat al ergens voor staat', 'Een website die al iets oplevert', 'De eerste stappen richting automatisering zijn gezet'],
    improvements: ['Een merk dat nog niet overal even consistent is', 'Een website die meer kan converteren dan hij nu doet', 'Marketing die nog te veel handwerk kost'],
    advice: ['Consistente branding', 'Scherpere positionering', 'Conversieoptimalisatie', 'Klantbeleving verbeteren'],
    why: 'Dit is precies het punt waarop kleine, gerichte verbeteringen het meeste opleveren: de basis staat er al, dus elke ingreep heeft direct effect.',
    how: 'Ik kijk waar de grootste winst te behalen valt en pak dat gericht aan, zodat je merk en website eindelijk in dezelfde richting duwen.'
  },
  {
    max: 27,
    title: 'Sterke basis',
    intro: 'Je merk staat stevig en de meeste fundamenten zijn aanwezig, nu is het zaak om door te bouwen op wat al werkt.',
    strengths: ['Een herkenbaar en consistent merk', 'Een website die daadwerkelijk bijdraagt', 'Klanten die voor jou kiezen, niet alleen voor de prijs'],
    improvements: ['Zichtbaarheid buiten je bestaande netwerk', 'Autoriteit in je vakgebied', 'Content die structureel bijdraagt aan groei'],
    advice: ['Meer zichtbaarheid', 'Meer autoriteit', 'Strategische content', 'Verdere optimalisatie'],
    why: 'Een sterke basis zonder verdere groei-inspanning verwatert op termijn: juist nu is het moment om een voorsprong uit te bouwen tot een echt onderscheidend merk.',
    how: 'Ik help je van goed naar onmisbaar: scherpere zichtbaarheid, sterkere content en een merk dat autoriteit uitstraalt in je markt.'
  },
  {
    max: 32,
    title: 'Boost Level',
    intro: 'Je merk, website en systemen ondersteunen de groei uitstekend, je zit bij de kopgroep.',
    strengths: ['Een sterk en consistent merk op elk kanaal', 'Een website die actief bijdraagt aan omzet', 'Marketing die grotendeels op automaat draait'],
    improvements: ['Verdere schaalvergroting zonder kwaliteitsverlies', 'Nog slimmere automatisering', 'Positionering als marktleider in je niche'],
    advice: ['Schaalvergroting', 'Marketingautomatisering', 'Thought leadership', 'Marktpositie versterken'],
    why: 'Op dit niveau gaat het niet meer om repareren, maar om verdedigen en uitbouwen van je voorsprong voordat de concurrentie die inhaalt.',
    how: 'Ik denk met je mee op strategisch niveau: waar zit de volgende groeistap, en hoe zorgen we dat je systemen daarin meegroeien.'
  }
];

function getBand(score) {
  for (let i = 0; i < BANDS.length; i++) {
    if (score <= BANDS[i].max) return BANDS[i];
  }
  return BANDS[BANDS.length - 1];
}

function listHtml(items) {
  return items.map(function (item) {
    return '<li style="margin-bottom:8px;">' + escapeHtml(item) + '</li>';
  }).join('');
}

function buildAnalysisEmail({ name, score, band, contactUrl }) {
  return `
<div style="margin:0; padding:0; background:#EBE6D8; font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 20px;">
    <div style="background:#0E0E12; border-radius:20px 20px 0 0; padding:28px 32px;">
      <span style="font-family:Georgia, 'Times New Roman', serif; font-weight:bold; font-size:20px; color:#F6F3EC; letter-spacing:-0.5px;">Boost<span style="color:#FF5A3C;">Lab</span></span>
    </div>
    <div style="background:#F6F3EC; padding:36px 32px;">
      <p style="font-size:16px; color:#0E0E12; margin:0 0 18px;">Hoi ${escapeHtml(name)},</p>
      <p style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 28px;">Bedankt voor het invullen van de Boost Check. Hieronder vind je je persoonlijke Boost Analyse.</p>

      <div style="background:#0E0E12; border-radius:16px; padding:28px 24px; text-align:center; margin-bottom:28px;">
        <p style="font-family:Arial, sans-serif; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#9C9AA0; margin:0 0 8px;">Jouw Boost Score</p>
        <p style="font-size:44px; font-weight:bold; color:#CCFF66; margin:0 0 6px;">${score} / 32</p>
        <p style="font-size:18px; font-weight:bold; color:#F6F3EC; margin:0;">${escapeHtml(band.title)}</p>
      </div>

      <p style="font-size:15px; line-height:1.7; color:#0E0E12; margin:0 0 28px;">${escapeHtml(band.intro)}</p>

      <p style="font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#FF5A3C; font-weight:bold; margin:0 0 10px;">Wat goed gaat</p>
      <ul style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 26px; padding-left:20px;">${listHtml(band.strengths)}</ul>

      <p style="font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#FF5A3C; font-weight:bold; margin:0 0 10px;">Wat beter kan</p>
      <ul style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 26px; padding-left:20px;">${listHtml(band.improvements)}</ul>

      <p style="font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#FF5A3C; font-weight:bold; margin:0 0 10px;">Concrete aanbevelingen</p>
      <ul style="font-size:15px; line-height:1.6; color:#0E0E12; margin:0 0 26px; padding-left:20px;">${listHtml(band.advice)}</ul>

      <p style="font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#FF5A3C; font-weight:bold; margin:0 0 10px;">Waarom dit belangrijk is</p>
      <p style="font-size:15px; line-height:1.7; color:#0E0E12; margin:0 0 26px;">${escapeHtml(band.why)}</p>

      <p style="font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#FF5A3C; font-weight:bold; margin:0 0 10px;">Hoe BoostLab hierbij kan helpen</p>
      <p style="font-size:15px; line-height:1.7; color:#0E0E12; margin:0 0 32px;">${escapeHtml(band.how)}</p>

      <div style="background:linear-gradient(135deg,#CCFF66,#FF5A3C); background-color:#CCFF66; border-radius:16px; padding:28px 24px; text-align:center; margin-bottom:8px;">
        <p style="font-size:19px; font-weight:bold; color:#0E0E12; margin:0 0 10px;">Plan een vrijblijvend gesprek</p>
        <p style="font-size:14px; line-height:1.6; color:#0E0E12; margin:0 0 20px;">In een persoonlijk gesprek kijken we waar jouw grootste groeikansen liggen en hoe BoostLab kan helpen bij merk, website, automatisering en zichtbaarheid.</p>
        <a href="${contactUrl}" style="display:inline-block; background:#0E0E12; color:#F6F3EC; text-decoration:none; font-size:14px; font-weight:bold; padding:14px 28px; border-radius:100px;">Maak een afspraak met mij</a>
      </div>
    </div>
    <div style="background:#0E0E12; border-radius:0 0 20px 20px; padding:22px 32px; text-align:center;">
      <p style="font-size:12px; color:#9C9AA0; margin:0 0 4px;">Boost Lab Agency — Tilburg</p>
      <p style="font-size:12px; color:#9C9AA0; margin:0;">jip@boostlab-agency.nl · +31 6 42 82 29 66</p>
    </div>
  </div>
</div>`;
}

function buildInternalEmail({ name, company, email, phone, website, score, band, answers }) {
  const answersHtml = (Array.isArray(answers) ? answers : []).map(function (a, i) {
    return '<p style="margin:0 0 10px;"><strong>' + (i + 1) + '. ' + escapeHtml(a && a.question) + '</strong><br>' + escapeHtml(a && a.answer) + '</p>';
  }).join('');

  return `
<div style="font-family:Arial, Helvetica, sans-serif; max-width:600px; margin:0 auto; color:#0E0E12; line-height:1.6;">
  <h2 style="margin:0 0 1em;">Nieuwe Boost Check-aanvraag</h2>
  <p style="margin:0 0 .6em;"><strong>Naam:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 .6em;"><strong>Bedrijfsnaam:</strong> ${escapeHtml(company)}</p>
  <p style="margin:0 0 .6em;"><strong>E-mail:</strong> ${escapeHtml(email)}</p>
  <p style="margin:0 0 .6em;"><strong>Telefoonnummer:</strong> ${escapeHtml(phone) || '-'}</p>
  <p style="margin:0 0 .6em;"><strong>Website:</strong> ${escapeHtml(website) || '-'}</p>
  <p style="margin:0 0 1.4em;"><strong>Boost Score:</strong> ${score} / 32 — ${escapeHtml(band.title)}</p>
  <hr style="border:none; border-top:1px solid #ddd; margin:0 0 1.2em;">
  <p style="margin:0 0 .8em; font-weight:bold;">Gegeven antwoorden</p>
  ${answersHtml || '<p>Geen antwoorden meegestuurd.</p>'}
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
    const company = (body.company || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const website = (body.website || '').trim();
    const score = Number(body.score);
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!name || !company || !email || !Number.isFinite(score)) {
      res.status(400).json({ error: 'Verplichte velden ontbreken.' });
      return;
    }

    const contactEmail = process.env.CONTACT_EMAIL;
    if (!contactEmail) {
      res.status(500).json({ error: 'CONTACT_EMAIL is niet ingesteld.' });
      return;
    }

    const band = getBand(score);
    const contactUrl = 'https://boostlab-agency.nl/contact/#plannen';

    await sendEmail({
      to: contactEmail,
      replyTo: email,
      subject: `Nieuwe Boost Check — ${company} (${score}/32)`,
      html: buildInternalEmail({ name, company, email, phone, website, score, band, answers })
    });

    await sendEmail({
      to: email,
      subject: 'Jouw Boost Analyse — BoostLab',
      html: buildAnalysisEmail({ name, score, band, contactUrl })
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('api/boost-check error', err);
    res.status(500).json({ error: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.' });
  }
};
