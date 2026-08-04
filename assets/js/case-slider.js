/* Case pages — "Visuele impressie" photo slideshow */
(function(){
  'use strict';

  document.querySelectorAll('[data-case-slider]').forEach(function(slider){
    var track = slider.querySelector('.case-slider__track');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.case-slider__slide'));
    var prevBtn = slider.querySelector('.case-slider__arrow--prev');
    var nextBtn = slider.querySelector('.case-slider__arrow--next');
    var dotsWrap = slider.querySelector('.case-slider__dots');
    var total = slides.length;
    if(!track || total <= 1) return;

    var current = 0;
    var dots = slides.map(function(_, i){
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'case-slider__dot';
      dot.setAttribute('aria-label', 'Ga naar foto ' + (i + 1) + ' van ' + total);
      dot.addEventListener('click', function(){ go(i); });
      if(dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function update(){
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function(d, i){ d.classList.toggle('is-active', i === current); });
    }
    function go(i){ current = (i + total) % total; update(); }

    if(prevBtn) prevBtn.addEventListener('click', function(){ go(current - 1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ go(current + 1); });

    var startX = null;
    slider.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, { passive:true });
    slider.addEventListener('touchend', function(e){
      if(startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if(Math.abs(dx) > 40){ dx < 0 ? go(current + 1) : go(current - 1); }
      startX = null;
    }, { passive:true });

    update();
  });
})();
