/* Insights — search + category filter */
(function(){
  'use strict';
  var searchInput = document.getElementById('insightSearch');
  var buttons = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('[data-category]');
  if(!cards.length) return;

  var activeFilter = 'all';

  function applyFilters(){
    var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var visibleCount = 0;
    cards.forEach(function(card){
      var cats = card.getAttribute('data-category');
      var text = card.getAttribute('data-search') || '';
      var matchesFilter = activeFilter === 'all' || cats.indexOf(activeFilter) !== -1;
      var matchesQuery = !query || text.toLowerCase().indexOf(query) !== -1;
      var show = matchesFilter && matchesQuery;
      card.style.display = show ? '' : 'none';
      if(show) visibleCount++;
    });
    var empty = document.getElementById('insightsEmpty');
    if(empty) empty.style.display = visibleCount ? 'none' : 'block';
  }

  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      buttons.forEach(function(b){ b.classList.remove('chip--filled'); });
      btn.classList.add('chip--filled');
      activeFilter = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  if(searchInput){
    searchInput.addEventListener('input', applyFilters);
  }
})();
