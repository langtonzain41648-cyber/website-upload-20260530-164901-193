(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var nav = document.querySelector("[data-nav]");
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");

    function setNavState() {
      if (!nav) {
        return;
      }
      if (window.scrollY > 20) {
        nav.classList.add("nav-scrolled");
      } else {
        nav.classList.remove("nav-scrolled");
      }
    }

    setNavState();
    window.addEventListener("scroll", setNavState, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        menu.hidden = open;
      });
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = 0;
    var timer;

    if (!slides.length) {
      return;
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));

    inputs.forEach(function (input) {
      var scope = input.closest(".movie-list-wrap") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var empty = scope.querySelector(".empty-state");

      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var match = !q || text.indexOf(q) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  window.initVideoPlayer = function (src) {
    var box = document.querySelector(".player-box");
    var video = document.querySelector(".player-video");
    var overlay = document.querySelector(".player-overlay");
    var playButton = document.querySelector(".player-play");
    var fullscreen = document.querySelector(".player-fullscreen");
    var hls;
    var attached = false;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          playVideo();
        }, { once: true });
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function activate() {
      attach();
      if (overlay) {
        overlay.classList.add("player-overlay-hidden");
      }
      video.controls = true;
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener("click", activate);
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        activate();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        activate();
      } else {
        video.pause();
      }
    });

    if (fullscreen && box) {
      fullscreen.addEventListener("click", function () {
        if (box.requestFullscreen) {
          box.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
  });
})();
