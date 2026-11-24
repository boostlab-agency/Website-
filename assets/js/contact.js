/* Contact page — interactive flask illustration + path selector scroll */
(function(){
  'use strict';

  document.querySelectorAll('[data-scroll-to]').forEach(function(el){
    el.addEventListener('click', function(e){
      var target = document.querySelector(el.getAttribute('data-scroll-to'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  var flask = document.querySelector('.flask');
  if(flask && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var wrap = flask.closest('.flask-wrap');
    wrap.addEventListener('mousemove', function(e){
      var r = wrap.getBoundingClientRect();
      var x = (e.clientX - r.left)/r.width - .5;
      var y = (e.clientY - r.top)/r.height - .5;
      flask.style.transform = 'rotate('+(x*10)+'deg) translate('+(x*10)+'px,'+(y*10)+'px)';
    });
    wrap.addEventListener('mouseleave', function(){ flask.style.transform = 'none'; });
  }

  /* Formulier wordt via /api/contact.js (Resend) verstuurd, geen mailto meer. */
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function(f){ if(!f.value.trim()) valid = false; });
      var status = document.getElementById('formStatus');
      if(!valid){
        if(status){ status.textContent = 'Vul alle verplichte velden in.'; status.className = 'form-status is-error'; }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;
      if(status){ status.textContent = 'Bezig met versturen...'; status.className = 'form-status'; }

      var payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        company: document.getElementById('company').value.trim(),
        budget: document.getElementById('budget').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value.trim()
      };
      var phoneEl = document.getElementById('phone');
      if(phoneEl && phoneEl.value.trim()) payload.message += '\n\nTelefoon: ' + phoneEl.value.trim();

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(data){
          if(!res.ok) throw new Error(data.error || ('Serverfout (HTTP ' + res.status + ')'));
          return data;
        });
      }).then(function(){
        if(window.blTrack) window.blTrack('lead_contact');
        if(status){ status.textContent = 'Verstuurd! We nemen binnen één werkdag contact op.'; status.className = 'form-status is-success'; }
        form.reset();
      }).catch(function(err){
        console.error('Contactformulier: versturen via /api/contact mislukt —', err);
        var detail = (err && err.message) ? err.message : 'onbekende fout';
        if(status){ status.textContent = 'Versturen mislukt (' + detail + '). Mail ons direct via jip@boostlab-agency.nl.'; status.className = 'form-status is-error'; }
      }).finally(function(){
        if(submitBtn) submitBtn.disabled = false;
      });
    });
  }
})();
