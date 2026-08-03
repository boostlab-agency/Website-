/* Cases filter */
(function(){
  'use strict';
  var buttons = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('[data-category]');
  if(!buttons.length) return;

  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      buttons.forEach(function(b){ b.classList.remove('chip--filled'); });
      btn.classList.add('chip--filled');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function(card){
        var cats = card.getAttribute('data-category');
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        if(show){
          card.style.display = '';
          requestAnimationFrame(function(){
            card.style.opacity = '1';
            card.style.transform = 'none';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(.94)';
          setTimeout(function(){ if(card.style.opacity === '0') card.style.display = 'none'; }, 320);
        }
      });
    });
  });

  cards.forEach(function(card){
    card.style.transition = 'opacity .32s var(--ease-out), transform .32s var(--ease-out)';
  });
})();
