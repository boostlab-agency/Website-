/* Stappenformulier voor landingspagina's (Google Ads).
   - Werkt voor elk <form class="sf" data-service="..."> op de pagina, ook meerdere tegelijk.
   - Vragen staan in de HTML (fieldset.sf-step); dit script regelt alleen stappen, verzenden en meten.
   - Verstuurt via /api/contact (Resend), net als het oude landingsformulier.
   - Conversie: window.blTrack('lead_contact') na succesvol versturen (zie tracking.js).
   - Zet zoekwoord, campagne en gclid in de mail, zodat je per lead ziet waar hij vandaan komt. */
(function () {
  'use strict';

  /* Advertentiegegevens bewaren voor deze sessie: de bezoeker kan eerst rondklikken. */
  var SRC_KEY = 'bl-lp-source';
  var source = {};
  try { source = JSON.parse(sessionStorage.getItem(SRC_KEY) || '{}'); } catch (e) {}
  var qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'].forEach(function (k) {
    if (qs.get(k)) source[k] = qs.get(k);
  });
  try { sessionStorage.setItem(SRC_KEY, JSON.stringify(source)); } catch (e) {}

  function sourceLines() {
    var out = [];
    if (source.utm_term) out.push('Zoekwoord: ' + source.utm_term);
    if (source.utm_campaign) out.push('Campagne: ' + source.utm_campaign);
    if (source.utm_source || source.utm_medium) out.push('Bron: ' + [source.utm_source, source.utm_medium].filter(Boolean).join(' / '));
    if (source.gclid || source.gbraid || source.wbraid) out.push('Google Ads klik: ja');
    return out;
  }

  var forms = document.querySelectorAll('form.sf');
  if (!forms.length) return;
  var startTracked = false;

  Array.prototype.forEach.call(forms, function (form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.sf-step'));
    var bar = form.querySelector('.sf-progress__fill');
    var counter = form.querySelector('.sf-count');
    var back = form.querySelector('.sf-back');
    var status = form.querySelector('.sf-status');
    var submit = form.querySelector('.sf-submit');
    var done = form.querySelector('.sf-done');
    var current = 0;
    var viaPointer = false;

    function show(i, focus) {
      current = i;
      steps.forEach(function (s, n) {
        s.hidden = n !== i;
        s.classList.toggle('is-active', n === i);
      });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + '%';
      if (counter) counter.textContent = 'Stap ' + (i + 1) + ' van ' + steps.length;
      if (back) back.hidden = i === 0;
      toggleSiteField();
      if (focus) {
        var target = steps[i].querySelector('.sf-q');
        if (target) target.focus({ preventScroll: true });
        /* Op mobiel het formulier in beeld houden als de stap korter is dan de vorige. */
        var r = form.getBoundingClientRect();
        if (r.top < 0) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function answer(step) {
      var checked = step.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : '';
    }

    /* Veld "Huidige website" alleen tonen als iemand al een site heeft. */
    function toggleSiteField() {
      var site = form.querySelector('.sf-site');
      if (!site) return;
      var first = answer(steps[0]);
      site.hidden = !first || first === 'Nog geen website';
    }

    function next() {
      if (!startTracked && window.blTrack) {
        startTracked = true;
        window.blTrack('form_start', { page: form.getAttribute('data-service') || document.title });
      }
      if (current < steps.length - 1) show(current + 1, true);
    }

    form.addEventListener('pointerdown', function () { viaPointer = true; });
    form.addEventListener('keydown', function (e) {
      viaPointer = false;
      /* Toetsenbord: pijltjes kiezen een optie, Enter gaat door. */
      if (e.key === 'Enter' && e.target.type === 'radio') {
        e.preventDefault();
        if (answer(steps[current])) next();
      }
    });

    form.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      toggleSiteField();
      if (viaPointer) setTimeout(next, 220);
    });

    if (back) back.addEventListener('click', function () {
      if (current > 0) show(current - 1, true);
    });

    function setStatus(msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'sf-status' + (type ? ' is-' + type : '');
    }

    function field(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? el.value.trim() : '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var page = form.getAttribute('data-service') || document.title;
      var name = field('name');
      var email = field('email');
      var phone = field('phone');

      /* Spamval: echte bezoekers zien dit veld niet. */
      if (field('company_site')) { finish(name); return; }

      var phoneEl = form.querySelector('[name="phone"]');
      var phoneRequired = phoneEl && phoneEl.required;
      if (!name || !email || email.indexOf('@') < 1 || email.indexOf('.') < 0 || (phoneRequired && phone.replace(/\D/g, '').length < 9)) {
        setStatus(phoneRequired ? 'Vul je naam, e-mailadres en telefoonnummer in.' : 'Vul je naam en een geldig e-mailadres in.', 'error');
        return;
      }

      var lines = ['Aanvraag via het stappenformulier op: ' + page, ''];
      steps.forEach(function (s) {
        var q = s.querySelector('.sf-q');
        var a = answer(s);
        if (q && a) lines.push(q.textContent.trim() + ' ' + a);
      });
      lines.push('Telefoon: ' + (phone || '-'));
      var site = field('site');
      var siteWrap = form.querySelector('.sf-site');
      if (site && !(siteWrap && siteWrap.hidden)) lines.push('Huidige website: ' + site);
      var src = sourceLines();
      if (src.length) { lines.push(''); lines = lines.concat(src); }

      if (submit) submit.disabled = true;
      setStatus('Bezig met versturen...');

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          company: '',
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
        if (window.blTrack) window.blTrack('lead_contact', { page: page, form: 'stappenformulier' });
        finish(name);
      }).catch(function (err) {
        console.error('Stappenformulier: versturen mislukt', err);
        setStatus('Versturen mislukt. Bel of app ons op 06 42 82 29 66, of mail jip@boostlab-agency.nl.', 'error');
        if (submit) submit.disabled = false;
      });
    });

    function finish(name) {
      var first = (name || '').split(' ')[0];
      var hello = form.querySelector('.sf-done__name');
      if (hello) hello.textContent = first ? 'Bedankt, ' + first + '!' : 'Bedankt!';
      form.classList.add('is-done');
      steps.forEach(function (s) { s.hidden = true; });
      if (done) {
        done.hidden = false;
        var h = done.querySelector('.sf-done__name');
        if (h) h.focus({ preventScroll: true });
      }
      if (bar) bar.style.width = '100%';
    }

    show(0, false);
  });
})();
