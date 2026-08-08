/* openvideo-plugin-template - 后台 tab 示例（OpenVideoAdmin API） */
(function () {
    'use strict';
    OpenVideoAdmin.registerTab({
        id: 'template-panel',
        title: 'template',
        mount(el) {
            el.innerHTML = `
                <div class="card">
                    <h3><span class="dot" style="background:var(--accent)"></span>${'template'} 调试面板</h3>
                    <p style="font-size:12px;color:var(--text2);margin-bottom:10px">
                        通过 OpenVideoAdmin.api('/api/plugin/template') 读取后端数据：
                    </p>
                    <pre id="templateOutput" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;overflow:auto"></pre>
                </div>`;
            OpenVideoAdmin.api('/api/plugin/template').then(function (d) {
                document.getElementById('templateOutput').textContent = JSON.stringify(d, null, 2);
            });
        }
    });
})();
