/* openvideo-plugin-template - 后台 tab 示例（OpenVideoAdmin API） */
(function () {
    'use strict';
    var _t = (typeof I18N !== 'undefined' && I18N.t) ? function (s) { return I18N.t(s); } : function (s) { return s; };
    OpenVideoAdmin.registerTab({
        id: 'template-panel',
        title: 'template',
        mount(el) {
            el.innerHTML = `
                <div class="card">
                    <h3><span class="dot" style="background:var(--accent)"></span>${'template'} ${_t('调试面板')}</h3>
                    <p style="font-size:12px;color:var(--text2);margin-bottom:10px">
                        ${_t('通过插件 API 读取后端数据')}
                    </p>
                    <pre id="templateOutput" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;overflow:auto"></pre>
                </div>`;
            OpenVideoAdmin.api('/api/plugin/template').then(function (d) {
                document.getElementById('templateOutput').textContent = JSON.stringify(d, null, 2);
            });
        }
    });
})();
