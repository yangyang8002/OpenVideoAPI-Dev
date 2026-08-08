'use strict';
/* ==========================================================================
 * 启动开发服务器（隔离数据目录 + 插件目录 + 热重载）
 * 用法: node tools/dev.js [端口]   （默认 1920，避免与生产 1919 冲突）
 * 服务端代码位于 server/（npm run setup 克隆）
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SERVER_JS = path.join(ROOT, 'server', 'server.js');
const PORT = process.argv[2] || process.env.PORT || '1920';

if (!fs.existsSync(SERVER_JS)) {
    console.error('未找到 server/server.js，请先执行: npm run setup');
    process.exit(1);
}

function start() {
    const child = spawn(process.execPath, ['server.js'], {
        cwd: path.join(ROOT, 'server'),
        env: {
            ...process.env,
            OPENVIDEO_DEV: '1',                                  /* 开发模式：插件热重载 */
            OPENVIDEO_PLUGIN_DIR: path.join(ROOT, 'plugins'),    /* 插件目录 = 本仓库 plugins/ */
            OPENVIDEO_DATA_DIR: path.join(ROOT, '.data'),        /* 隔离数据目录 */
            OPENVIDEO_PLUGIN_REGISTRY: 'file://' + path.join(ROOT, 'registry.json'),/* 本地插件市场（绝对路径 file:// 源） */
            PORT
        },
        stdio: 'inherit'
    });
    child.on('exit', (code) => {
        if (code !== 0 && !process.env.OPENVIDEO_DEV_NO_RESTART) {
            console.log('\n[dev] 服务异常退出 (' + code + ')，3 秒后重启...');
            setTimeout(start, 3000);
        } else {
            process.exit(0);
        }
    });
    console.log('[dev] OpenVideoAPI 开发服务器: http://localhost:' + PORT + '/admin/');
}

start();
