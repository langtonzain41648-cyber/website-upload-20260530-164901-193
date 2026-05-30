function initPlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }
    var shell = video.closest('.player-shell');
    var cover = shell ? shell.querySelector('.play-cover') : null;
    var hlsInstance = null;
    var started = false;

    function bindStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                setTimeout(resolve, 1200);
            });
        }
        video.src = streamUrl;
        return Promise.resolve();
    }

    function start() {
        started = true;
        if (cover) {
            cover.classList.add('is-hidden');
        }
        bindStream().then(function () {
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    video.controls = true;
                });
            }
        });
    }

    if (cover) {
        cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });
}
