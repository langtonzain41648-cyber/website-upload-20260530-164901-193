(function() {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'));
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    let index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.dataset.dot || 0));
      });
    });

    setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  const list = document.querySelector('[data-card-list]');
  const localSearch = document.querySelector('[data-local-search]');
  const yearFilter = document.querySelector('[data-year-filter]');
  if (list) {
    const cards = Array.from(list.querySelectorAll('.movie-card'));
    if (yearFilter) {
      const years = Array.from(new Set(cards.map(function(card) {
        return card.dataset.year || '';
      }).filter(Boolean))).sort().reverse();
      years.forEach(function(year) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + ' 年';
        yearFilter.appendChild(option);
      });
    }

    function applyLocalFilter() {
      const keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
      const year = yearFilter ? yearFilter.value : '';
      cards.forEach(function(card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchYear = !year || card.dataset.year === year;
        card.style.display = matchKeyword && matchYear ? '' : 'none';
      });
    }

    if (localSearch) {
      localSearch.addEventListener('input', applyLocalFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyLocalFilter);
    }
  }

  const globalInput = document.getElementById('globalSearchInput');
  const globalType = document.getElementById('globalTypeFilter');
  const globalResults = document.getElementById('globalSearchResults');
  if (globalInput && globalResults && Array.isArray(window.siteSearchData)) {
    function renderGlobalSearch() {
      const keyword = globalInput.value.trim().toLowerCase();
      const type = globalType ? globalType.value : '';
      const results = window.siteSearchData.filter(function(item) {
        const haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.one].join(' ').toLowerCase();
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchType = !type || item.type === type;
        return matchKeyword && matchType;
      }).slice(0, 80);

      globalResults.innerHTML = results.map(function(item) {
        return '<article class="movie-card small-card">' +
          '<a class="poster-wrap" href="./' + item.url + '">' +
          '<img src="' + item.img + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
          '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<a class="card-title" href="./' + item.url + '">' + escapeHtml(item.title) + '</a>' +
          '<p>' + escapeHtml(item.one) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function(ch) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[ch];
      });
    }

    globalInput.addEventListener('input', renderGlobalSearch);
    if (globalType) {
      globalType.addEventListener('change', renderGlobalSearch);
    }
    renderGlobalSearch();
  }
}());
