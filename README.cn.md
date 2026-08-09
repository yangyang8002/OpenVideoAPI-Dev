# OpenVideoAPI-Dev

OpenVideoAPI 的**插件开发环境**。克隆本仓库即可开始开发插件——无需手动搭服务、无需发布 npm 包，改代码自动热重载。

English | [中文](README.cn.md)

## 快速开始

```bash
npm run setup          # 克隆服务端代码到 server/ + 安装依赖 + 隔离数据目录 .data/
npm run dev            # 启动开发服务器 http://localhost:1920/admin/ (账号 admin/admin123)
npm run new myplugin   # 生成插件骨架 plugins/openvideo-plugin-myplugin/
```

## 目录结构

```
OpenVideoAPI-Dev/
├── server/              # OpenVideoAPI 服务端代码（setup 克隆，git 管理可随时 pull）
├── plugins/             # ★ 你的插件都放这里（本地包，无需 npm 发布）
│   ├── openvideo-plugin-demo/       # 完整示例：服务 / 动态表 / 事件 / 后台 tab / 播放器钩子
│   └── openvideo-plugin-<你的>/      # npm run new 生成
├── tools/
│   ├── setup.js         # 初始化（克隆 server + 装依赖）
│   ├── dev.js           # 启动开发服务器
│   └── new-plugin.js    # 插件脚手架
├── registry.json        # 本地插件市场（file:// 源，演示用）
└── .data/               # 隔离的数据目录（与生产互不影响）
```

## 开发流程

1. **新建插件**：`npm run new hello` 生成 `plugins/openvideo-plugin-hello/`
2. **启动**：`npm run dev`（默认端口 1920，与生产 1919 隔离）
3. **启用**：后台「插件管理」→ 启用 `openvideo-plugin-hello`
4. **开发**：修改 `plugins/<包>/lib/` 下任意 `.js/.json` 文件 → **自动热重载**（无需重启）
5. **验证**：`/api/plugin/hello`（路由）、后台 tab、播放器钩子

## 开发环境特性（服务端支持）

| 特性 | 说明 |
| --- | --- |
| 插件目录可配置 | `OPENVIDEO_PLUGIN_DIR` 指向本仓库 `plugins/` |
| 数据目录隔离 | `OPENVIDEO_DATA_DIR` 指向 `.data/`，不碰生产数据 |
| 热重载 | `OPENVIDEO_DEV=1` 时监听本地插件文件变更，自动卸载+重载（400ms 防抖） |
| 本地插件市场 | `OPENVIDEO_PLUGIN_REGISTRY=file://../registry.json`（`file://` 源支持） |
| 崩溃自动重启 | dev 服务器异常退出后 3 秒自动拉起 |
| 端口隔离 | 默认 1920（`node tools/dev.js 3000` 可改） |

## 插件规范

插件是 **npm 包**，`package.json` 的 `openvideoPlugin` 字段声明能力（inject/provide/schema/client）。后端 `apply(ctx, config)`；前端 `OpenVideoAdmin.registerTab` / `OpenVideoPlayer.replace`。完整文档：<https://doc.mbps.top/plugins/>

## 提交你的插件

1. 发布到 npm（包名建议 `openvideo-plugin-*`）
2. 向 [OpenVideoAPI 仓库](https://github.com/yangyang8002/OpenVideoAPI) 提交 PR，登记到 `plugin-registry.json`

## 相关仓库

- [OpenVideoAPI](https://github.com/yangyang8002/OpenVideoAPI) — 服务端
- [OpenVideoAPI Docs](https://github.com/yangyang8002/Artplayer-Web-Api-Docs) — 文档站（doc.mbps.top）

## License

MIT
