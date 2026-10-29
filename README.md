# Rex 模块合集（video 片单 + stream 播放源）

两件套：`video` 模块负责**首页/资源库的片单海报**，`stream` 模块负责**点进影片后解析真实播放地址**。

## 模块清单

| 模块 | id | 类型 | 说明 |
|------|----|------|------|
| 高清片源聚合 | `app.mi3s.homes` | video | 首页片单走 TMDB 片库：最新更新 / 热播榜 / 分类 / 题材 |
| 高清片源 | `app.mi3s.hires` | stream | 28 个苹果CMS源 + 6 个直播源 + 测试片直链，按片名解析真实 m3u8 |
| 诊断 | `app.mi3s.diag` | video | 自检 `type:tmdb` 渲染链路（固定 Fight Club + 实时 trending），排查"列表空白"用 |
| 4KVM 播放源 | `hyj1817.4kvm.resource` | stream | 4KVM 影视 HLS 播放源（开源） |
| 苹果CMS 聚合源 | `hyj1817.maccms.resource` | stream | 通用苹果CMS聚合，可配站点/翻页/季匹配（开源） |
| 4K 聚合源 | `app.mi3s.k4sources` | stream | 100 个苹果CMS影视源多源聚合，优先4K/蓝光线路 |

## 远程订阅地址（统一走 jsDelivr，国内可直连）

```
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/home.js        # 首页片单 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/hires.js       # 播放源 stream
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/diag.js        # 诊断 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/4k-sources.js  # 4K 聚合 stream
```

> `raw.githubusercontent.com` 国内基本被墙，直接添加会报「无法识别的模块数据」，务必用 jsDelivr。
> 更新后如需立即生效，可访问 `https://purge.jsdelivr.net/gh/mi3suuu/rex-hires@main/home.js` 刷新 CDN。

## ★ 关键契约：id 与 rating 必须是**字符串**

`type:"tmdb"` 条目要能被客户端渲染成海报，字段必须严格按官方类型定义
[`@rexnow/libs` video.ts](https://github.com/baranwang/rex-widget-libs/blob/main/packages/libs/src/env/video.ts) 的 `VideoItem`：

```ts
id: string            // ← 字符串！TMDB 场景为纯数字串 "550"（不要写数字 550）
type: 'tmdb'
title: string
posterPath?: string   // ← TMDB 相对路径 "/xxx.jpg"，客户端自己拼 image.tmdb.org
backdropPath?: string
mediaType?: 'tv'|'movie'
rating?: string       // ← 字符串！"8.4"（不要写数字 8.4）
```

**回传数字的后果**：Swift 端 `as? String` 强转失败 → 条目被判无效 → 整个列表空白，
界面表现为「没有更多了」。这是 v2.3.0 及以前一直"显示空"的真正根因。

> 网上流传的官方 `rex-tmdb.js` 明文源码里写的是 `id: item.id`（数字），那是官方模块
> 被客户端特判兜底的旧写法；**第三方模块照抄会失败**。可对照作者本人的成品模块
> [douban-bridge](https://www.npmjs.com/package/@rexnow/douban) 的 `r2()`：
> `id: String(tmdbId)`、`rating: String(e.rating)`、`posterPath` 为剥掉图床前缀的相对路径。

可以用自带诊断模块快速验证：安装 `diag.js` → 资源库点「诊断」→ 能看到 Fight Club 海报，
说明渲染链路通；仍是空白则说明问题不在字段，而在模块加载/网络。

## 两种模块类型的区别

- `video` —— 列表组件，返回 `VideoItem[]` 片单（带海报），用于首页「发现」与资源库浏览。
- `stream` —— 播放源解析器，`loadResource(params)` 返回 `VideoResource[]`：

```js
{ name, description, url, customHeaders, playerType: "app" }
```

点进影片后，Rex 拿片名（`params.seriesName || params.title`）去调**所有已注册的 `stream` 模块**，
谁返回了地址就用谁播。所以「播放源」必须是 `stream` 类型。

## 首页布局包（homes-package.rex）

`homes-package.rex` 是「发现」首页的布局包（`rex-manifest.json` + `rex-layout.json` + `rex-home.json`），
4 行 `fullWidthPoster` 分别绑 `latest / hot / category / genre` 四个函数，`widgetURL` 指向上面的 jsDelivr home.js。
导入后在 Rex「发现」页即是 4 排海报。

## 实测

- 片名「Big Buck Bunny」→ 返回 Mux 1080p 直链
- 片名「NASA」→ 返回 NASA TV 直播流
- 片名「流浪地球」→ 从苹果CMS源解析出真实 m3u8 播放地址

## 100 个 4K 源站（app.mi3s.k4sources）

从抖音/社区评论区线索反搜 GitHub（LunaTV-config）、空壳影视 mac-cms、北海博客等公开聚合页，
去重合并出 100 个苹果CMS采集源：4K 级 60 个、HD 级 12 个、AD 级 28 个。
影视源会频繁换域名/关停，实测约 39 个当前可达，模块运行时对失效源自动跳过。
源站清单是「快照」而非「永久可用」，失效后按站名反搜新域名替换。
