/* Boost Lab Agency — core interactions (cursor, loader, reveal, magnetic, transitions, nav) */
(function(){
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function(){
    var loader = document.querySelector('.loader');
    if(!loader) return;
    var minTime = 900;
    var start = Date.now();
    var elapsed = Date.now() - start;
    setTimeout(function(){
      loader.classList.add('is-done');
      document.body.classList.add('is-loaded');
      setTimeout(function(){ loader.remove(); }, 1200);
    }, Math.max(0, minTime - elapsed));
  });

  /* ---------- Page transition on internal navigation ---------- */
  var transitionEl = document.querySelector('.page-transition');
  if(transitionEl){
    document.addEventListener('click', function(e){
      var link = e.target.closest('a');
      if(!link) return;
      var href = link.getAttribute('href');
      if(!href || href.startsWith('#') || link.target === '_blank' || link.hasAttribute('download')) return;
      if(href.startsWith('http') && href.indexOf(location.hostname) === -1) return;
      if(link.hasAttribute('data-no-transition')) return;
      e.preventDefault();
      transitionEl.classList.add('is-active');
      setTimeout(function(){ window.location.href = href; }, 560);
    });
  }

  /* ---------- Custom cursor ---------- */
  if(isFinePointer && !reducedMotion){
    var dot = document.createElement('div');
    dot.className = 'cursor';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var label = document.createElement('div');
    label.className = 'cursor-label';
    document.body.append(dot, ring, label);
    document.body.classList.add('cursor-ready');

    var mx=0,my=0, rx=0,ry=0;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d('+mx+'px,'+my+'px,0) translate(-50%,-50%)';
      label.style.transform = 'translate3d('+(mx+26)+'px,'+(my+26)+'px,0) translate(-50%,-50%)';
    });
    (function loop(){
      rx += (mx-rx)*.16; ry += (my-ry)*.16;
      ring.style.transform = 'translate3d('+rx+'px,'+ry+'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .magnetic, [data-cursor]').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        document.body.classList.add('cursor-hover');
        var txt = el.getAttribute('data-cursor');
        if(txt){ label.textContent = txt; document.body.classList.add('cursor-label-active'); }
      });
      el.addEventListener('mouseleave', function(){
        document.body.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-label-active');
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if(isFinePointer && !reducedMotion){
    document.querySelectorAll('.magnetic').forEach(function(el){
      var strength = 26;
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2;
        var y = e.clientY - r.top - r.height/2;
        el.style.transform = 'translate('+(x/r.width*strength)+'px,'+(y/r.height*strength)+'px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Nav: scroll state, active link ---------- */
  var nav = document.querySelector('.nav');
  if(nav){
    var onScroll = function(){
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mega-menu__links a').forEach(function(a){
      var href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')){
        a.classList.add('is-active');
      }
    });
  }

  /* ---------- Fullscreen mega menu ---------- */
  (function(){
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('megaMenu');
    var closeBtn = document.getElementById('megaMenuClose');
    if(!toggle || !menu) return;

    var open = function(){
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      var first = menu.querySelector('a');
      if(first) first.focus();
    };
    var close = function(){
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      toggle.focus();
    };

    toggle.addEventListener('click', function(){
      menu.classList.contains('is-open') ? close() : open();
    });
    if(closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });

    /* Click on the dimmed/blurred backdrop (outside the glass panel) closes the menu too */
    var panel = menu.querySelector('.mega-menu__inner');
    menu.addEventListener('click', function(e){
      if(!menu.classList.contains('is-open')) return;
      if(panel && panel.contains(e.target)) return;
      if(closeBtn && closeBtn.contains(e.target)) return;
      close();
    });
  })();

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-scale], [data-reveal-left], [data-reveal-right], [data-stagger], .kinetic');
  if('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.18, rootMargin:'0px 0px -8% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Kinetic text split ---------- */
  document.querySelectorAll('[data-split]').forEach(function(el){
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function(w){
      return '<span class="word"><span>'+w+'&nbsp;</span></span>';
    }).join('');
    el.classList.add('kinetic');
  });

  /* ---------- Marquee auto-duplicate for seamless loop ---------- */
  document.querySelectorAll('.marquee__track').forEach(function(track){
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Parallax hero blobs ---------- */
  if(!reducedMotion){
    var parallaxEls = document.querySelectorAll('[data-parallax]');
    if(parallaxEls.length){
      window.addEventListener('scroll', function(){
        var y = window.scrollY;
        parallaxEls.forEach(function(el){
          var speed = parseFloat(el.getAttribute('data-parallax')) || .2;
          el.style.transform = 'translate3d(0,'+(y*speed)+'px,0)';
        });
      }, {passive:true});
    }
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

})();
