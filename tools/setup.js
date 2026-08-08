'use strict';
/* ==========================================================================
 * 初始化开发环境：
 *   1. 克隆 / 更新 OpenVideoAPI 服务端代码到 server/
 *   2. npm install 服务端依赖
 *   3. 创建隔离数据目录 .data/
 * 用法: node tools/setup.js
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SERVER_DIR = path.join(ROOT, 'server');
const REPO = 'https://github.com/yangyang8002/OpenVideoAPI.git';

function sh(cmd, cwd) {
    console.log('> ' + cmd);
    try {
        execSync(cmd, { cwd: cwd || ROOT, stdio: 'inherit', timeout: 600000 });
        return true;
    } catch (e) {
        console.error('执行失败: ' + cmd);
        return false;
    }
}

/* 1. 服务端代码 */
if (!fs.existsSync(path.join(SERVER_DIR, 'server.js'))) {
    if (fs.existsSync(SERVER_DIR)) {
        console.log('server/ 目录已存在但缺少 server.js，请检查后重试（可删除 server/ 重新克隆）');
        process.exit(1);
    }
    console.log('[1/3] 克隆 OpenVideoAPI 服务端代码...');
    if (!sh('git clone ' + REPO + ' server')) process.exit(1);
} else {
    console.log('[1/3] server/ 已存在');
    try {
        console.log('     尝试拉取最新代码（可跳过）...');
        sh('git -C "' + SERVER_DIR + '" pull --ff-only');
    } catch (e) {}
}

/* 2. 服务端依赖 */
console.log('[2/3] 安装服务端依赖...');
if (!sh('npm install --no-audit --no-fund', SERVER_DIR)) process.exit(1);

/* 3. 数据目录 */
console.log('[3/3] 创建隔离数据目录 .data/ ...');
fs.mkdirSync(path.join(ROOT, '.data'), { recursive: true });

console.log('\n✔ 开发环境就绪！');
console.log('  启动: npm run dev        → http://localhost:1920/admin/ (账号 admin/admin123)');
console.log('  新建插件: npm run new <插件名>');
console.log('  插件目录: plugins/  （文件变更自动热重载，无需重启）');
