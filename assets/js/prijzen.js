/* Prijzen — sticky category nav active-state and accordion FAQ */
(function(){
  'use strict';

  /* ---------- Sticky category nav ---------- */
  var navLinks = document.querySelectorAll('.pricing-nav a, .pricing-jump a');
  var categories = Array.prototype.slice.call(document.querySelectorAll('.price-category'));

  if('IntersectionObserver' in window && categories.length && navLinks.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.id;
          navLinks.forEach(function(a){
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin:'-40% 0px -50% 0px', threshold:0 });
    categories.forEach(function(cat){ io.observe(cat); });
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion__trigger').forEach(function(trigger){
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.addEventListener('click', function(){
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if(panel) panel.classList.toggle('is-open', !isOpen);
    });
  });
})();
