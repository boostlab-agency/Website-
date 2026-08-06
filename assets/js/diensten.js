/* Boost Lab Agency — diensten.html scroll storytelling
   Progress bar, continuous rail fill, active-step highlight and per-section
   parallax (background chapter numbers + service images) driven by one
   rAF-throttled scroll loop. */
(function(){
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var order = ['branding', 'websites', 'platformen', 'ai-automatisering', 'identiteit', 'grafisch'];
  var sections = order.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var railItems = document.querySelectorAll('.story-rail__item');
  var fill = document.getElementById('storyFill');
  var progressBar = document.getElementById('scrollProgress');

  if(!sections.length) return;

  /* Active-step highlight (cheap, kept even under reduced-motion) */
  if('IntersectionObserver' in window && railItems.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.id;
          railItems.forEach(function(item){
            item.classList.toggle('is-active', item.getAttribute('data-story') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(function(s){ io.observe(s); });
  }

  if(reducedMotion) return;

  var ticking = false;

  function update(){
    ticking = false;
    var vh = window.innerHeight;

    /* Whole-page scroll progress bar */
    if(progressBar){
      var scrollable = document.documentElement.scrollHeight - vh;
      var p = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressBar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    }

    /* Continuous rail fill across the four service sections */
    if(fill){
      var firstTop = sections[0].getBoundingClientRect().top + window.scrollY;
      var lastRect = sections[sections.length - 1].getBoundingClientRect();
      var lastBottom = lastRect.top + window.scrollY + lastRect.height;
      var railP = (window.scrollY + vh * 0.5 - firstTop) / (lastBottom - firstTop);
      fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, railP)) + ')';
    }

    /* Per-section parallax: background chapter numbers + service images */
    sections.forEach(function(sec){
      var r = sec.getBoundingClientRect();
      var norm = ((r.top + r.height / 2) - vh / 2) / vh; /* ~ -1 (below) .. 0 (centered) .. 1 (above) */

      var num = sec.querySelector('.service-num');
      if(num){
        num.style.transform = 'translate(-50%, calc(-50% + ' + (norm * -50) + 'px)) scale(' + (1 + Math.abs(norm) * 0.08) + ')';
      }
      var img = sec.querySelector('.service-parallax-img');
      if(img){
        img.style.transform = 'translateY(' + (norm * 28) + 'px) rotate(' + (norm * -1.6) + 'deg)';
      }
    });
  }

  function onScrollOrResize(){
    if(!ticking){
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  update();
})();
