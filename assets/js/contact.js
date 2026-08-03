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

  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function(f){ if(!f.value.trim()) valid = false; });
      if(!valid){
        e.preventDefault();
        var status = document.getElementById('formStatus');
        if(status){ status.textContent = 'Vul alle verplichte velden in.'; status.className = 'form-status is-error'; }
      }
    });
  }
})();
