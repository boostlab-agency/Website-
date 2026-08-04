/* Case pages — scroll storytelling: story-rail active-step highlight,
   continuous rail fill and top scroll-progress bar. Order is derived
   automatically from the rail markup, no per-page config needed. */
(function(){
  'use strict';

  var railItems = document.querySelectorAll('.story-rail__item');
  if(!railItems.length) return;

  var order = Array.prototype.map.call(railItems, function(item){ return item.getAttribute('data-story'); });
  var sections = order.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var fill = document.getElementById('storyFill');
  var progressBar = document.getElementById('scrollProgress');
  if(!sections.length) return;

  if('IntersectionObserver' in window){
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

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reducedMotion) return;

  var ticking = false;
  function update(){
    ticking = false;
    var vh = window.innerHeight;

    if(progressBar){
      var scrollable = document.documentElement.scrollHeight - vh;
      var p = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressBar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    }

    if(fill){
      var firstTop = sections[0].getBoundingClientRect().top + window.scrollY;
      var lastRect = sections[sections.length - 1].getBoundingClientRect();
      var lastBottom = lastRect.top + window.scrollY + lastRect.height;
      var railP = (window.scrollY + vh * 0.5 - firstTop) / (lastBottom - firstTop);
      fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, railP)) + ')';
    }
  }
  function onScrollOrResize(){
    if(!ticking){ window.requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener('scroll', onScrollOrResize, { passive:true });
  window.addEventListener('resize', onScrollOrResize);
  update();
})();
