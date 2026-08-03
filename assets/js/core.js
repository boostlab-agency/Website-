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

  /* ---------- Nav: scroll state, mobile toggle, active link ---------- */
  var nav = document.querySelector('.nav');
  if(nav){
    var onScroll = function(){
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    var toggle = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    if(toggle && links){
      toggle.addEventListener('click', function(){
        var open = links.classList.toggle('is-open');
        document.body.classList.toggle('nav-open', open);
      });
      links.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          links.classList.remove('is-open');
          document.body.classList.remove('nav-open');
        });
      });
    }

    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a').forEach(function(a){
      var href = a.getAttribute('href');
      if(href === path || (path === '' && href === 'index.html')){
        a.classList.add('is-active');
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-scale], [data-stagger], .kinetic');
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
