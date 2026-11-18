/* Boost Check — interactive quiz engine, scoring, on-page analysis and the
   automatic Boost Analyse e-mail.

   Versturen gaat via /api/boost-check.js (Vercel serverless function, zie
   die map), die met Resend twee mails stuurt: een interne notificatie naar
   CONTACT_EMAIL en de uitgebreide HTML Boost Analyse naar de bezoeker zelf.
   Lukt dat om wat voor reden dan ook niet, dan valt het formulier terug op
   een mailto-concept naar Jip zodat de lead nooit verloren gaat. */
(function(){
  'use strict';

  /* Smooth scroll for the hero CTA */
  document.querySelectorAll('[data-scroll-to]').forEach(function(el){
    el.addEventListener('click', function(e){
      var target = document.querySelector(el.getAttribute('data-scroll-to'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  var quiz = document.getElementById('boostQuiz');
  if(!quiz) return;

  var steps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz__step'));
  var total = steps.length;
  var progressBar = document.getElementById('quizProgressBar');
  var progressWrap = document.getElementById('quizProgress');
  var stepLabel = document.getElementById('quizStepLabel');
  var backBtn = document.getElementById('quizBack');
  var quizWrap = document.getElementById('quizWrap');
  var resultEl = document.getElementById('quizResult');

  var current = 0;
  var answers = new Array(total).fill(null);
  var answerDetails = new Array(total).fill(null);

  function updateProgress(){
    var pct = (current / total) * 100;
    if(progressBar) progressBar.style.width = pct + '%';
    if(progressWrap) progressWrap.setAttribute('aria-valuenow', current);
    if(stepLabel) stepLabel.textContent = 'Vraag ' + Math.min(current + 1, total) + ' van ' + total;
    if(backBtn) backBtn.disabled = current === 0;
  }

  function showStep(i){
    steps.forEach(function(s, idx){ s.classList.toggle('is-active', idx === i); });
    updateProgress();
  }

  function selectAnswer(stepIndex, points, cardEl){
    answers[stepIndex] = points;
    var questionEl = steps[stepIndex].querySelector('.quiz__question');
    var textEl = cardEl.querySelector('.quiz__card-text');
    answerDetails[stepIndex] = {
      question: questionEl ? questionEl.textContent.trim() : '',
      answer: textEl ? textEl.textContent.trim() : ''
    };
    var cards = steps[stepIndex].querySelectorAll('.quiz__card');
    cards.forEach(function(c){ c.classList.remove('is-selected'); });
    cardEl.classList.add('is-selected');
    setTimeout(function(){
      if(stepIndex < total - 1){
        current = stepIndex + 1;
        showStep(current);
      } else {
        finishQuiz();
      }
    }, 420);
  }

  steps.forEach(function(step, idx){
    step.querySelectorAll('.quiz__card').forEach(function(card){
      card.addEventListener('click', function(){
        selectAnswer(idx, parseInt(card.getAttribute('data-points'), 10), card);
      });
    });
  });

  if(backBtn){
    backBtn.addEventListener('click', function(){
      if(current > 0){
        current -= 1;
        showStep(current);
      }
    });
  }

  var bands = [
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

  function getBand(score){
    for(var i = 0; i < bands.length; i++){
      if(score <= bands[i].max) return bands[i];
    }
    return bands[bands.length - 1];
  }

  function fillList(el, items){
    if(!el) return;
    el.innerHTML = '';
    items.forEach(function(item){
      var li = document.createElement('li');
      li.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--lime-dim); flex:0 0 auto; margin-top:.15em;"><polyline points="20 6 9 17 4 12"/></svg><span>' + item + '</span>';
      el.appendChild(li);
    });
  }

  var lastScore = 0;
  var lastBand = bands[0];

  function finishQuiz(){
    lastScore = answers.reduce(function(sum, p){ return sum + (p || 0); }, 0);
    lastBand = getBand(lastScore);

    var scoreNumberEl = document.getElementById('quizScoreNumber');
    var titleEl = document.getElementById('quizResultTitle');
    var descEl = document.getElementById('quizResultDesc');
    var scoreFieldEl = document.getElementById('quizScoreField');

    if(scoreNumberEl) scoreNumberEl.textContent = lastScore + ' / 32';
    if(titleEl) titleEl.textContent = lastBand.title;
    if(descEl) descEl.textContent = lastBand.intro;
    if(scoreFieldEl) scoreFieldEl.value = lastScore + '/32 - ' + lastBand.title;

    fillList(document.getElementById('quizResultStrengths'), lastBand.strengths);
    fillList(document.getElementById('quizResultImprovements'), lastBand.improvements);
    fillList(document.getElementById('quizResultAdvice'), lastBand.advice);

    if(quizWrap) quizWrap.hidden = true;
    if(resultEl){
      resultEl.hidden = false;
      resultEl.scrollIntoView({ behavior:'smooth', block:'start' });
      requestAnimationFrame(function(){
        resultEl.classList.add('is-visible');
        document.querySelectorAll('.boost-result-card').forEach(function(card){ card.classList.add('is-visible'); });
      });
    }
  }

  function answersSummaryText(){
    return answerDetails.map(function(a, i){
      if(!a) return '';
      return (i + 1) + '. ' + a.question + ' — ' + a.answer;
    }).filter(Boolean).join('\n');
  }

  /* Lead form: validate, then send via /api/boost-check.js (Resend).
     LET OP: de mailto-fallback is tijdelijk verwijderd (op verzoek) zodat
     fouten in de Resend-koppeling zichtbaar blijven in plaats van stil
     opgevangen te worden. Voeg 'm pas terug als /api/boost-check bevestigd
     werkt. */
  var leadForm = document.getElementById('boostLeadForm');
  if(leadForm){
    leadForm.addEventListener('submit', function(e){
      e.preventDefault();
      var required = leadForm.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function(f){ if(!f.value.trim()) valid = false; });
      var status = document.getElementById('boostFormStatus');

      if(!valid){
        if(status){ status.textContent = 'Vul alle verplichte velden in.'; status.className = 'form-status is-error'; }
        return;
      }

      var submitBtn = leadForm.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;
      if(status){ status.textContent = 'Bezig met versturen...'; status.className = 'form-status'; }

      var name = document.getElementById('bcNaam').value.trim();
      var email = document.getElementById('bcEmail').value.trim();
      var company = document.getElementById('bcBedrijf').value.trim();
      var phone = document.getElementById('bcTelefoon').value.trim();
      var website = document.getElementById('bcWebsite').value.trim();

      var payload = {
        name: name,
        email: email,
        company: company,
        phone: phone,
        website: website,
        score: lastScore,
        answers: answerDetails.filter(Boolean)
      };

      fetch('/api/boost-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(data){
          if(!res.ok) throw new Error(data.error || ('Serverfout (HTTP ' + res.status + ')'));
          return data;
        });
      }).then(function(){
        if(window.blTrack) window.blTrack('lead_boost_check', { score: lastScore });
        if(status){ status.textContent = 'Gelukt! Check je inbox, je uitgebreide Boost Analyse is onderweg.'; status.className = 'form-status is-success'; }
        leadForm.reset();
      }).catch(function(err){
        console.error('Boost Check: versturen via /api/boost-check mislukt —', err);
        var detail = (err && err.message) ? err.message : 'onbekende fout';
        if(status){ status.textContent = 'Versturen mislukt (' + detail + '). Probeer het later opnieuw of mail ons via jip@boostlab-agency.nl.'; status.className = 'form-status is-error'; }
      }).finally(function(){
        if(submitBtn) submitBtn.disabled = false;
      });
    });
  }
})();
