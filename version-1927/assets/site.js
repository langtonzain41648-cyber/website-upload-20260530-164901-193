(function () {
    var navButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(parseInt(dot.getAttribute('data-slide') || '0', 10));
            startHero();
        });
    });
    startHero();

    function textOf(card, attr) {
        return (card.getAttribute(attr) || '').toLowerCase();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('.catalog-search');
        var year = scope.querySelector('.catalog-year');
        var region = scope.querySelector('.catalog-region');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    textOf(card, 'data-title'),
                    textOf(card, 'data-year'),
                    textOf(card, 'data-region'),
                    textOf(card, 'data-genre'),
                    textOf(card, 'data-tags')
                ].join(' ');
                var okQuery = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || card.getAttribute('data-year') === y;
                var okRegion = !r || card.getAttribute('data-region') === r;
                card.style.display = okQuery && okYear && okRegion ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
        if (region) {
            region.addEventListener('change', applyFilter);
        }
    });

    function initPlayer(card) {
        var video = card.querySelector('video');
        var button = card.querySelector('.play-cover');
        var src = card.getAttribute('data-video');
        var started = false;

        function fail() {
            card.classList.add('error');
            if (button) {
                button.innerHTML = '<span>!</span><strong>视频暂时无法播放</strong>';
            }
        }

        function play() {
            if (!video || !src) {
                fail();
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            fail();
                        }
                    });
                } else {
                    fail();
                    return;
                }
                started = true;
            }
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    card.classList.add('playing');
                }).catch(function () {
                    card.classList.add('playing');
                });
            } else {
                card.classList.add('playing');
            }
        }

        card.addEventListener('click', function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                return;
            }
            play();
        });
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
    }

    document.querySelectorAll('.player-card').forEach(initPlayer);

    function renderSearch() {
        var input = document.getElementById('search-input');
        var grid = document.getElementById('search-results');
        var empty = document.getElementById('search-empty');
        var title = document.getElementById('search-title');
        if (!input || !grid || !empty || !title || typeof MovieIndex === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function makeCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card compact">' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
                '<img src="./' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="score-pill">' + escapeHtml(String(movie.score)) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
                '<p>' + escapeHtml(movie.one_line) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</article>';
        }

        function doSearch(value) {
            var q = value.trim().toLowerCase();
            if (!q) {
                grid.innerHTML = '';
                title.textContent = '开始搜索';
                empty.textContent = '输入关键词，探索更多精彩内容。';
                empty.style.display = '';
                return;
            }
            var results = MovieIndex.filter(function (movie) {
                var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.one_line, movie.tags.join(' ')].join(' ').toLowerCase();
                return haystack.indexOf(q) !== -1;
            }).slice(0, 120);
            title.textContent = '找到 ' + results.length + ' 个结果';
            grid.innerHTML = results.map(makeCard).join('');
            empty.style.display = results.length ? 'none' : '';
            if (!results.length) {
                empty.textContent = '未找到相关结果，换个关键词再试。';
            }
        }

        input.addEventListener('input', function () {
            doSearch(input.value);
        });
        doSearch(query);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    renderSearch();
})();
