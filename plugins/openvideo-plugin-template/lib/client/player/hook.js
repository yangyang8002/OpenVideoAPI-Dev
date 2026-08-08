/* openvideo-plugin-template - 播放器钩子示例（OpenVideoPlayer API） */
(function () {
    'use strict';
    OpenVideoPlayer.onReady(function (ctx) {
        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;top:52px;right:12px;z-index:98;pointer-events:none;' +
            'background:rgba(0,0,0,.45);color:#fff;font-size:11px;padding:4px 10px;border-radius:6px;' +
            'font-family:monospace;border:1px solid rgba(124,92,252,.35);';
        el.textContent = 'template plugin ready';
        ctx.container.appendChild(el);
    });
})();
