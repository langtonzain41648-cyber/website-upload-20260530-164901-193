
import { H as Hls } from './hls-vendor.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

function initNavigation() {
  const btn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('is-open'));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) nav.classList.remove('is-open');
  });
}

function initHeroCarousel() {
  const stage = document.querySelector('[data-hero-carousel]');
  if (!stage) return;
  const slides = Array.from(stage.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(stage.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) return;
  let index = 0;
  let timer = null;
  const setActive = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => setActive(index + 1), 6000);
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      setActive(Number(dot.dataset.heroDot || 0));
      start();
    });
  });
  stage.addEventListener('mouseenter', stop);
  stage.addEventListener('mouseleave', start);
  setActive(0);
  start();
}

function filterScope(scope, query) {
  const cards = Array.from(scope.querySelectorAll('[data-card]'));
  const q = (query || '').trim().toLowerCase();
  let count = 0;
  for (const card of cards) {
    const blob = (card.dataset.search || '').toLowerCase();
    const match = !q || blob.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) count += 1;
  }
  return count;
}

function initSearch() {
  const forms = Array.from(document.querySelectorAll('[data-search-form]'));
  forms.forEach((form) => {
    const input = form.querySelector('[data-search-input]');
    const reset = form.querySelector('[data-search-reset]');
    const scope = form.closest('.category-page, .page-top, main')?.querySelector('[data-search-scope]') || document.querySelector('[data-search-scope]');
    if (!input || !scope) return;
    const run = () => filterScope(scope, input.value);
    input.addEventListener('input', run);
    if (reset) reset.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
    run();
  });
}

function initPlayer() {
  const video = document.querySelector('[data-player-video]');
  const dataNode = document.querySelector('[data-stream-data]');
  if (!video || !dataNode) return;
  let streams = [];
  try {
    streams = JSON.parse(dataNode.textContent || '[]');
  } catch (err) {
    streams = [];
  }
  const buttons = Array.from(document.querySelectorAll('[data-stream-tab]'));
  let hls = null;

  const destroy = () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  };

  const play = (url) => {
    if (!url) return;
    buttons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.streamUrl === url));
    destroy();
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.load();
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data && data.fatal) {
          const next = streams.find((item) => item !== url);
          if (next) play(next);
        }
      });
      return;
    }
    video.src = url;
  };

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => play(btn.dataset.streamUrl));
    if (idx === 0 && btn.dataset.streamUrl) play(btn.dataset.streamUrl);
  });
  if (!buttons.length && streams.length) play(streams[0]);
}

ready(() => {
  initNavigation();
  initHeroCarousel();
  initSearch();
  initPlayer();
});
