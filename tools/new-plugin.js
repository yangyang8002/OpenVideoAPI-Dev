'use strict';
/* ==========================================================================
 * 插件脚手架：生成一个可运行的插件包（契约 v2）
 * 用法: node tools/new-plugin.js <插件名>
 * 生成: plugins/openvideo-plugin-<插件名>/
 *       （后端 + 生命周期钩子 + 后台 tab + 播放器钩子 + README）
 * 契约: 主仓库 OpenVideoAPI 根目录 PLUGIN-CONTRACT.md（v1 + v2 全量说明）
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
        /* 契约 v2（26.10.0+）可选字段：不需要可整段删除
         * deps.openvideo 为主程序语义化版本范围；
         * deps.plugins 为依赖插件表（版本范围，安装时自动递归启用） */
        deps: {
            openvideo: '>=26.10.0'
        },
        /* 契约 v2 生命周期钩子：值为模块导出的函数名
         * （一次性 ctx，15s 超时，异常仅记日志） */
        hooks: {
            install: 'onInstall',
            enable: 'onEnable',
            disable: 'onDisable',
            uninstall: 'onUninstall',
            update: 'onUpdate'
        },
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
 * ${pkgName} - OpenVideoAPI 插件
 * 能力：ctx 服务注入 / 路由 / 动态表 / 事件 / 日志 / 前端扩展 / v2 生命周期钩子
 * 契约：主仓库 OpenVideoAPI 根目录 PLUGIN-CONTRACT.md（v1 + v2 全量说明）
 *       v2 完整范例见本仓库 plugins/openvideo-plugin-demo（v1.1.0）
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

        /* 3. 事件：监听弹幕发送（v2 起 ctx.on 返回取消函数；v1 返回 undefined） */
        const offDanmu = ctx.on('danmu:send', (danmu) => {
            if (config.enabled) ctx.logger.debug('${name}', '[' + danmu.vid + '] ' + danmu.text);
        });

        /* 4. 定时任务示例（v2 可改用 ctx.cron.every/at，dispose 自动清理） */
        const timer = setInterval(() => {
            ctx.logger.debug('${name}', '心跳 ' + config.greeting);
        }, 60000);

        /* 5. 卸载清理 */
        ctx.on('dispose', () => {
            clearInterval(timer);
            if (offDanmu) offDanmu();
            ctx.logger.info('${name}', '已卸载');
        });

        /* v2 更多能力（26.10.0+，按需取用，详见 PLUGIN-CONTRACT.md）：
         *   ctx.static(mountPath, dir)                      托管包内静态资源
         *   ctx.pages.register({ route,file,title,auth })   自定义后台页面
         *   ctx.cron.every(ms, fn) / ctx.cron.at(date, fn)  定时任务
         *   ctx.settings.get/set/del/all                    插件私有 KV 设置
         *   ctx.logs.debug/info/warn/error                  插件专属日志（GET /api/admin/plugins/logs）
         *   ctx.i18n.add/locales/t                          词条注入（GET /api/plugins/i18n）
         *   ctx.bus.on/once/off/emit/emitTo/events          插件间事件总线
         *   ctx.model.namespace(ns).define(table)           命名空间表（ns__table 隔离）
         *   ctx.http.request/text                           超时可控 HTTP 客户端
         */
    },

    /* ---- v2 生命周期钩子（manifest.hooks 声明；一次性 ctx，15s 超时，异常仅记日志） ---- */
    async onInstall(ctx) {
        ctx.logs.info('${name}: 生命周期 install');
    },
    async onEnable(ctx) {
        ctx.logs.info('${name}: 生命周期 enable');
    },
    async onDisable(ctx) {
        ctx.logs.info('${name}: 生命周期 disable');
    },
    async onUninstall(ctx) {
        ctx.logs.info('${name}: 生命周期 uninstall');
    },
    async onUpdate(ctx) {
        ctx.logs.info('${name}: 生命周期 update');
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

const readmeMd = `# ${pkgName}

由 \`npm run new ${name}\` 生成的插件骨架（OpenVideoAPI-Dev 开发环境）。

## 结构

| 文件 | 说明 |
| --- | --- |
| \`package.json\` | manifest：\`openvideoPlugin\` 声明能力，含契约 v2 可选字段 \`deps\` / \`hooks\`（不需要可删除） |
| \`lib/index.js\` | 后端入口：\`apply(ctx, config)\` + 生命周期钩子（install/enable/disable/uninstall/update） |
| \`lib/client/admin/panel.js\` | 后台调试 tab（OpenVideoAdmin.registerTab） |
| \`lib/client/player/hook.js\` | 播放器钩子（OpenVideoPlayer.onReady） |

## 开始开发

1. \`npm run dev\` → <http://localhost:1920/admin/>（账号 admin/admin123）
2. 「插件管理」→ 启用 \`${pkgName}\`
3. 修改 \`lib/\` 下任意 \`.js/.json\` 文件 → 自动热重载（OPENVIDEO_DEV=1，400ms 防抖）

## 插件契约

- 完整契约（v1 + v2）：主仓库 [OpenVideoAPI](https://github.com/yangyang8002/OpenVideoAPI) 根目录 \`PLUGIN-CONTRACT.md\`
- v2 能力（26.10.0+，完全向后兼容，v1 插件无需修改）：\`static\` / \`pages.register\` / \`cron.every|at\` / \`settings\` / \`logs\` / \`i18n\` / \`bus\` / \`model.namespace\` / \`http.request|text\`
- v2 完整范例：本仓库 \`plugins/openvideo-plugin-demo\`（v1.1.0，自定义页面 / 静态资源 / 定时任务 / 事件 / 模型命名空间）
- 在线文档：<https://doc.mbps.top/plugins/>
`;

fs.mkdirSync(path.join(dir, 'lib', 'client', 'admin'), { recursive: true });
fs.mkdirSync(path.join(dir, 'lib', 'client', 'player'), { recursive: true });
fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'lib', 'index.js'), indexJs);
fs.writeFileSync(path.join(dir, 'lib', 'client', 'admin', 'panel.js'), adminPanel);
fs.writeFileSync(path.join(dir, 'lib', 'client', 'player', 'hook.js'), playerHook);
fs.writeFileSync(path.join(dir, 'README.md'), readmeMd);

console.log('✔ 已生成插件包: ' + dir);
console.log('  下一步:');
console.log('  1. npm run dev               # 启动开发服务器（已启用热重载）');
console.log('  2. 打开 http://localhost:1920/admin/ 登录 admin/admin123');
console.log('  3. 「插件管理」→ 插件列表 → 启用 ' + pkgName);
console.log('  4. 修改 lib/ 下文件自动热重载');
console.log('  5. 插件契约（v1+v2）见主仓库 PLUGIN-CONTRACT.md；v2 范例见 plugins/openvideo-plugin-demo@1.1.0');
