'use strict';
/* ==========================================================================
 * 插件脚手架：生成一个可运行的 Koishi 风格插件包
 * 用法: node tools/new-plugin.js <插件名>
 * 生成: plugins/openvideo-plugin-<插件名>/（含后端 + 后台 tab + 播放器钩子）
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLUGINS_DIR = path.join(ROOT, 'plugins');
const NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]{1,31}$/;

const name = (process.argv[2] || '').trim();
if (!NAME_RE.test(name)) {
    console.error('用法: node tools/new-plugin.js <插件名>\n插件名需为 2-32 位字母/数字/下划线/中划线，且以字母开头');
    process.exit(1);
}

const pkgName = 'openvideo-plugin-' + name;
const dir = path.join(PLUGINS_DIR, pkgName);
if (fs.existsSync(dir)) {
    console.error('插件已存在: ' + dir);
    process.exit(1);
}

const manifest = {
    name: pkgName,
    version: '0.1.0',
    description: name + ' 插件（OpenVideoAPI）',
    main: 'lib/index.js',
    license: 'MIT',
    openvideoPlugin: {
        name: name,
        description: '我的 ' + name + ' 插件',
        inject: ['store', 'model', 'app', 'logger', 'http'],
        provide: [],
        schema: [
            { key: 'greeting', label: '欢迎语', type: 'string', default: 'Hello from ' + name, hint: '启动时打印' },
            { key: 'enabled', label: '启用功能', type: 'boolean', default: true }
        ],
        client: {
            admin: {
                scripts: ['lib/client/admin/panel.js'],
                tabs: [{ id: name + '-panel', title: name }]
            },
            player: {
                scripts: ['lib/client/player/hook.js']
            }
        }
    }
};

const indexJs = `/* ==========================================================================
 * ${pkgName} - OpenVideoAPI 插件（Koishi 风格 npm 包）
 * 能力：ctx 服务注入 / 路由 / 动态表 / 事件 / 日志 / 前端扩展
 * ========================================================================== */
'use strict';

module.exports = {
    apply(ctx, config) {
        ctx.logger.info('${name}', '插件已加载，服务端 ' + ctx.version);

        /* 1. 路由：新增 API */
        ctx.router.get('/api/plugin/${name}', (req, res) => {
            res.json({ code: 0, data: { name: '${name}', greeting: config.greeting, uptime: ctx.app.uptime() } });
        });

        /* 2. 动态表：插件自己的数据 */
        const notes = ctx.model.define('${name}_notes', {
            primary: 'id',
            fields: { id: { type: 'string' }, text: { type: 'string' }, createdAt: { type: 'number' } }
        });

        /* 3. 事件：监听弹幕发送 */
        ctx.on('danmu:send', (danmu) => {
            if (config.enabled) ctx.logger.debug('${name}', '[' + danmu.vid + '] ' + danmu.text);
        });

        /* 4. 定时任务示例 */
        const timer = setInterval(() => {
            ctx.logger.debug('${name}', '心跳 ' + config.greeting);
        }, 60000);

        /* 5. 卸载清理 */
        ctx.on('dispose', () => {
            clearInterval(timer);
            ctx.logger.info('${name}', '已卸载');
        });
    }
};
`;

const adminPanel = `/* ${pkgName} - 后台 tab 示例（OpenVideoAdmin API） */
(function () {
    'use strict';
    OpenVideoAdmin.registerTab({
        id: '${name}-panel',
        title: '${name}',
        mount(el) {
            el.innerHTML = \`
                <div class="card">
                    <h3><span class="dot" style="background:var(--accent)"></span>\${'${name}'} 调试面板</h3>
                    <p style="font-size:12px;color:var(--text2);margin-bottom:10px">
                        通过 OpenVideoAdmin.api('/api/plugin/${name}') 读取后端数据：
                    </p>
                    <pre id="${name}Output" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;overflow:auto"></pre>
                </div>\`;
            OpenVideoAdmin.api('/api/plugin/${name}').then(function (d) {
                document.getElementById('${name}Output').textContent = JSON.stringify(d, null, 2);
            });
        }
    });
})();
`;

const playerHook = `/* ${pkgName} - 播放器钩子示例（OpenVideoPlayer API） */
(function () {
    'use strict';
    OpenVideoPlayer.onReady(function (ctx) {
        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;top:52px;right:12px;z-index:98;pointer-events:none;' +
            'background:rgba(0,0,0,.45);color:#fff;font-size:11px;padding:4px 10px;border-radius:6px;' +
            'font-family:monospace;border:1px solid rgba(124,92,252,.35);';
        el.textContent = '${name} plugin ready';
        ctx.container.appendChild(el);
    });
})();
`;

fs.mkdirSync(path.join(dir, 'lib', 'client', 'admin'), { recursive: true });
fs.mkdirSync(path.join(dir, 'lib', 'client', 'player'), { recursive: true });
fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'lib', 'index.js'), indexJs);
fs.writeFileSync(path.join(dir, 'lib', 'client', 'admin', 'panel.js'), adminPanel);
fs.writeFileSync(path.join(dir, 'lib', 'client', 'player', 'hook.js'), playerHook);

console.log('✔ 已生成插件包: ' + dir);
console.log('  下一步:');
console.log('  1. npm run dev               # 启动开发服务器（已启用热重载）');
console.log('  2. 打开 http://localhost:1920/admin/ 登录 admin/admin123');
console.log('  3. 「插件管理」→ 插件列表 → 启用 ' + pkgName);
console.log('  4. 修改 lib/ 下文件自动热重载');
