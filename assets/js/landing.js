/* Landingspagina's: aanvraagformulier via /api/contact (Resend) + conversie lead_contact. */
(function () {
  'use strict';
  var form = document.getElementById('lpForm');
  if (!form) return;

  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = document.getElementById('lpStatus');
    var name = val('lpName');
    var email = val('lpEmail');
    if (!name || !email || email.indexOf('@') < 1) {
      if (status) { status.textContent = 'Vul je naam en een geldig e-mailadres in.'; status.className = 'form-status is-error'; }
      return;
    }

    var page = form.getAttribute('data-service') || document.title;
    var lines = [
      'Aanvraag via landingspagina: ' + page,
      'Telefoon: ' + (val('lpPhone') || '-'),
      'Huidige website: ' + (val('lpSite') || '-'),
      '',
      val('lpMsg') || '(geen toelichting)'
    ];

    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    if (status) { status.textContent = 'Bezig met versturen...'; status.className = 'form-status'; }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        company: val('lpCompany'),
        budget: '',
        service: page,
        message: lines.join('\n')
      })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ('Serverfout (HTTP ' + res.status + ')'));
        return data;
      });
    }).then(function () {
      if (window.blTrack) window.blTrack('lead_contact', { page: page });
      if (status) { status.textContent = 'Verstuurd! We nemen binnen 1 werkdag contact met je op.'; status.className = 'form-status is-success'; }
      form.reset();
    }).catch(function (err) {
      console.error('Landingspagina: versturen mislukt', err);
      if (status) { status.textContent = 'Versturen mislukt. Bel of app ons op 06 42 82 29 66, of mail jip@boostlab-agency.nl.'; status.className = 'form-status is-error'; }
    }).finally(function () {
      if (btn) btn.disabled = false;
    });
  });
})();
