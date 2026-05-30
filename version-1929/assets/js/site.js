(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            showSlide(active + 1);
        }, 5600);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var target = Number(dot.getAttribute('data-target') || 0);
            showSlide(target);
            startHero();
        });
    });

    if (slides.length) {
        startHero();
    }

    var list = document.querySelector('.filter-list');
    var input = document.querySelector('.filter-input');
    var sort = document.querySelector('.sort-select');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!list) {
            return;
        }
        var query = normalize(input ? input.value : '');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            card.classList.toggle('is-filter-hidden', query && haystack.indexOf(query) === -1);
        });
    }

    function sortCards() {
        if (!list || !sort) {
            return;
        }
        var mode = sort.value;
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.sort(function (a, b) {
            var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
            var by = parseInt(b.getAttribute('data-year'), 10) || 0;
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';
            if (mode === 'year-desc') {
                return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'year-asc') {
                return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'title') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }
            return 0;
        });
        cards.forEach(function (card) {
            list.appendChild(card);
        });
        filterCards();
    }

    if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
        input.addEventListener('input', filterCards);
        filterCards();
    }

    if (sort) {
        sort.addEventListener('change', sortCards);
    }
})();
