(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
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
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.SearchItems) {
        var note = document.querySelector('[data-search-note]');
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('.search-page-form input[name="q"]');

        if (input) {
            input.value = query;
        }

        if (query) {
            var key = query.toLowerCase();
            var results = window.SearchItems.filter(function (item) {
                return [item.title, item.meta, item.text].join(' ').toLowerCase().indexOf(key) !== -1;
            }).slice(0, 80);

            if (note) {
                note.textContent = results.length ? '为你找到以下相关影片。' : '未找到匹配影片，可尝试更换关键词。';
            }

            function escapeHtml(value) {
                return String(value).replace(/[&<>"']/g, function (character) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[character];
                });
            }

            searchResults.innerHTML = results.map(function (item) {
                var title = escapeHtml(item.title);
                var type = escapeHtml(item.type);
                var meta = escapeHtml(item.meta);
                var text = escapeHtml(item.text);
                var url = encodeURI(item.url);
                var cover = encodeURI(item.cover);

                return [
                    '<article class="movie-card">',
                    '    <a class="poster-wrap" href="./' + url + '">',
                    '        <img src="' + cover + '" alt="' + title + '" loading="lazy">',
                    '        <span class="card-badge">' + type + '</span>',
                    '        <span class="card-score">' + escapeHtml(item.score) + '</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <h3><a href="./' + url + '">' + title + '</a></h3>',
                    '        <p class="card-meta">' + meta + '</p>',
                    '        <p class="card-desc">' + text + '</p>',
                    '        <div class="card-tags"><span>' + type + '</span></div>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
        }
    }
})();
