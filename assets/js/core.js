/* Boost Lab Agency — core interactions (cursor, loader, reveal, magnetic, transitions, nav) */
(function(){
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Loader ----------
     The intro only plays on the first page view of a session, and starts as
     soon as the DOM is ready (this script runs at the end of <body>) instead
     of waiting for every image/font via `load`. Repeat views skip it; the
     inline head script adds .no-intro so it never flashes. */
  (function(){
    var loader = document.querySelector('.loader');
    if(!loader) return;
    var seen = false;
    try { seen = sessionStorage.getItem('bl-intro') === '1'; sessionStorage.setItem('bl-intro', '1'); } catch(e){}
    if(seen || reducedMotion){
      loader.remove();
      document.body.classList.add('is-loaded');
      return;
    }
    var minTime = 1100; // lets the logo animation finish
    var elapsed = window.performance ? performance.now() : 0;
    setTimeout(function(){
      loader.classList.add('is-done');
      document.body.classList.add('is-loaded');
      setTimeout(function(){ loader.remove(); }, 1200);
    }, Math.max(0, minTime - elapsed));
  })();

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
      setTimeout(function(){ window.location.href = href; }, 380);
    });
  }

  /* ---------- Prefetch internal pages on hover/touch ---------- */
  var prefetched = {};
  function prefetch(e){
    var link = e.target.closest && e.target.closest('a[href^="/"]');
    if(!link) return;
    var href = link.getAttribute('href').split('#')[0];
    if(!href || prefetched[href] || href === location.pathname) return;
    prefetched[href] = true;
    var l = document.createElement('link');
    l.rel = 'prefetch'; l.href = href;
    document.head.appendChild(l);
  }
  document.addEventListener('mouseover', prefetch, {passive:true});
  document.addEventListener('touchstart', prefetch, {passive:true});

  /* ---------- Restore clean state when a page is served from bfcache ----------
     A browser back/forward navigation often restores the page from the
     back/forward cache via `pageshow` (persisted:true) instead of firing a
     fresh `load`. Without this, a page left mid-transition (is-active still
     set on .page-transition, or the loader mid-removal) stays frozen in that
     state forever when the user navigates back to it. */
  window.addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    var loader = document.querySelector('.loader');
    if(loader) loader.remove();
    document.body.classList.add('is-loaded');
    if(transitionEl) transitionEl.classList.remove('is-active', 'is-leaving');
  });

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

    dot.style.willChange = ring.style.willChange = label.style.willChange = 'transform';

    var mx=0,my=0, rx=0,ry=0, lastT=null;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
    }, {passive:true});

    function loop(t){
      if(lastT === null) lastT = t;
      var dt = Math.min(t - lastT, 48); /* clamp so a stall doesn't cause a jump */
      lastT = t;

      /* Dot and label track the pointer 1:1 for a direct, premium feel */
      dot.style.transform = 'translate3d('+mx+'px,'+my+'px,0) translate(-50%,-50%)';
      label.style.transform = 'translate3d('+(mx+26)+'px,'+(my+26)+'px,0) translate(-50%,-50%)';

      /* Ring trails with a frame-rate independent ease, snappier than before */
      var ease = 1 - Math.pow(1 - .3, dt / 16.67);
      rx += (mx-rx)*ease; ry += (my-ry)*ease;
      ring.style.transform = 'translate3d('+rx+'px,'+ry+'px,0) translate(-50%,-50%)';

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

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

    /* Clean URLs always resolve to a trailing-slash path, so comparison
       happens on normalized root-relative paths rather than raw filenames.
       Links carrying a #hash are skipped (they're CTAs, not the section's
       own nav item, so they shouldn't visually claim "active"). */
    var currentPath = location.pathname;
    if(currentPath !== '/' && currentPath.charAt(currentPath.length - 1) !== '/') currentPath += '/';
    document.querySelectorAll('.mega-menu__links a').forEach(function(a){
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) !== '/' || href.indexOf('#') !== -1) return;
      if(href.charAt(href.length - 1) !== '/') href += '/';
      if(href === currentPath) a.classList.add('is-active');
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
