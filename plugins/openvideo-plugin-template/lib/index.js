/* ==========================================================================
 * openvideo-plugin-template - OpenVideoAPI 插件
 * 能力：ctx 服务注入 / 路由 / 动态表 / 事件 / 日志 / 前端扩展
 * ========================================================================== */
'use strict';

module.exports = {
    apply(ctx, config) {
        ctx.logger.info('template', '插件已加载，服务端 ' + ctx.version);

        /* 1. 路由：新增 API */
        ctx.router.get('/api/plugin/template', (req, res) => {
            res.json({ code: 0, data: { name: 'template', greeting: config.greeting, uptime: ctx.app.uptime() } });
        });

        /* 2. 动态表：插件自己的数据 */
        const notes = ctx.model.define('template_notes', {
            primary: 'id',
            fields: { id: { type: 'string' }, text: { type: 'string' }, createdAt: { type: 'number' } }
        });

        /* 3. 事件：监听弹幕发送 */
        ctx.on('danmu:send', (danmu) => {
            if (config.enabled) ctx.logger.debug('template', '[' + danmu.vid + '] ' + danmu.text);
        });

        /* 4. 定时任务示例 */
        const timer = setInterval(() => {
            ctx.logger.debug('template', '心跳 ' + config.greeting);
        }, 60000);

        /* 5. 卸载清理 */
        ctx.on('dispose', () => {
            clearInterval(timer);
            ctx.logger.info('template', '已卸载');
        });
    }
};
