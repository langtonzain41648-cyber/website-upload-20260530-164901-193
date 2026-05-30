(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');

    if (!panel || !grid) {
      return;
    }

    var keywordInput = qs('[data-filter-keyword]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var sortSelect = qs('[data-sort-select]', panel);
    var count = qs('[data-result-count]', panel);
    var cards = qsa('[data-movie-card]', grid);

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-channel')
      ].join(' '));
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var isVisible = matchesKeyword && matchesYear && matchesType;

        card.classList.toggle('is-filter-hidden', !isVisible);

        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
        });
      }

      if (mode === 'score-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilters();
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }

    applyFilters();
  }

  function initPlayers() {
    qsa('.js-hls-player').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.player-overlay', player);
      var message = qs('[data-player-message]', player);
      var source = player.getAttribute('data-src');
      var hls = null;
      var initialized = false;

      if (!video || !source || !overlay) {
        return;
      }

      function setMessage(text, hidden) {
        if (!message) {
          return;
        }

        message.textContent = text || '';
        message.classList.toggle('is-hidden', Boolean(hidden));
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。', false);
            overlay.classList.remove('is-hidden');
          });
        }
      }

      function initialize() {
        if (initialized) {
          playVideo();
          return;
        }

        initialized = true;
        setMessage('正在加载播放源...', false);

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('', true);
            playVideo();
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请刷新页面后重试。', false);
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('', true);
            playVideo();
          }, { once: true });
        } else {
          setMessage('当前浏览器不支持 HLS 播放，请更换浏览器。', false);
          overlay.classList.remove('is-hidden');
        }
      }

      overlay.addEventListener('click', function () {
        overlay.classList.add('is-hidden');
        initialize();
      });

      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.detail) + '" data-movie-card>',
      '  <span class="movie-poster">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-badge">' + escapeHtml(movie.channel) + '</span>',
      '    <span class="poster-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></span>',
      '  </span>',
      '  <span class="movie-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>',
      '    <span class="movie-foot"><span>' + escapeHtml(movie.region) + '</span><span class="movie-tags">' + tags + '</span></span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');

    if (!page || !window.MOVIE_INDEX) {
      return;
    }

    var input = qs('[data-search-input]', page);
    var form = qs('[data-search-form]', page);
    var summary = qs('[data-search-summary]', page);
    var results = qs('[data-search-results]', page);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function search(text) {
      var keyword = normalize(text);
      var movies = window.MOVIE_INDEX || [];

      if (!keyword) {
        return movies.slice(0, 12);
      }

      return movies.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.channel,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 120);
    }

    function render(text) {
      var found = search(text);
      var keyword = normalize(text);

      if (summary) {
        summary.textContent = keyword ? ('找到 ' + found.length + ' 条相关结果') : '默认展示推荐片目。';
      }

      if (results) {
        results.innerHTML = found.map(movieCard).join('');
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var nextUrl = 'search.html' + (value ? ('?q=' + encodeURIComponent(value)) : '');
        window.history.replaceState(null, '', nextUrl);
        render(value);
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
