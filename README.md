# Rex 模块合集（video 片单 + stream 播放源）

两件套：`video` 模块负责**首页/资源库的片单海报**，`stream` 模块负责**点进影片后解析真实播放地址**。

## 模块清单

| 模块 | id | 类型 | 说明 |
|------|----|------|------|
| 高清片源聚合 | `app.mi3s.homes` | video | 片单走 Rex 官方发现服务（与 AI 搜索同源）：最新更新 / 热播榜 / 分类 / 题材 / 自由搜片 |
| 高清片源 | `app.mi3s.hires` | stream | 28 个苹果CMS源 + 6 个直播源 + 测试片直链，按片名解析真实 m3u8 |
| 诊断 | `app.mi3s.diag` | video | 对比「后端取片」（照抄 AI 搜索）vs「TMDB 取片」，定位列表空白根因 |
| 4KVM 播放源 | `hyj1817.4kvm.resource` | stream | 4KVM 影视 HLS 播放源（开源） |
| 苹果CMS 聚合源 | `hyj1817.maccms.resource` | stream | 通用苹果CMS聚合，可配站点/翻页/季匹配（开源） |
| 4K 聚合源 | `app.mi3s.k4sources` | stream | 100 个苹果CMS影视源多源聚合，优先4K/蓝光线路 |

## 远程订阅地址（统一走 jsDelivr，国内可直连）

```
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v6.0.0/home.js        # 首页片单 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v5.0.0/hires.js       # 播放源 stream
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v6.0.0/diag.js        # 诊断 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v5.0.0/4k-sources.js  # 4K 聚合 stream
```

> `raw.githubusercontent.com` 国内基本被墙，直接添加会报「无法识别的模块数据」，务必用 jsDelivr。
> 统一用不可变 tag（`@main` 有 12h/7d 强缓存，改了代码不生效）：`home.js`/`diag.js` 用 `@v6.0.0`，
> `hires.js`/`4k-sources.js`（stream 模块未变）用 `@v5.0.0`。
> 更新后如需立即生效，访问 `https://purge.jsdelivr.net/gh/mi3suuu/rex-hires@v6.0.0/home.js` 刷新 CDN。

## ★ 根因与最终实现（v6.0.0）

数据源走 Rex 官方发现后端（与 AI 搜索 `rex.nlsearch` 同源），这一点没错。反复「列表空白 / 没有更多」
的**真正根因是：第三方模块（isOfficial=false）的条目 `type` 用了 `"tmdb"`，而 `tmdb` 类型要走
Rex 内置的 TMDB 详情页 / 图片代理（TMDB 桥），第三方模块没有这个桥 → 整批条目失败**。

三重证据：

1. **官方「AI 搜索」是 isOfficial=true，能透传 `type:"tmdb"` 显示**——它的 `nlSearch` 直接
   `return data.data`，原样返回后端条目（数字 id、`type:"tmdb"`、相对 posterPath），能显示是
   因为官方模块内置了 TMDB 桥；这**不等于**第三方模块也能用 `type:"tmdb"`。
2. **反编译 Rex 主二进制**发现 `services.copy.tmdb.bridge.not.configured`（"TMDB 桥未配置"）和
   `tmdbImageProxyHost` 配置项；实测代理地址 `rexnow.tv/t/p`、`assets.rexnow.tv/t/p` 均 404。
3. **ForwardWidgets 官方文档**明确：`type:"url"` 走通用封面回退链（`coverUrl` 只填即可全位置
   出图），**不依赖 TMDB 桥**；`type:"tmdb"` / `douban` / `imdb` 才走内置详情页。

因此 `home.js` 的 `normalizeItem` 改为：`type` 用 `"url"`，`posterPath`/`backdropPath`/`coverUrl`
拼**完整 https 图片 URL**（`https://image.tmdb.org/t/p/w500/xxx.jpg`，实测国内可直连），并额外
保留 `tmdbId` 字段供播放链路使用：

```js
// home.js v6.0.0 关键改动
var IMG_BASE = "https://image.tmdb.org/t/p";
function normalizeItem(it) {
  var id = it.id != null ? String(it.id) : "";
  var poster = it.posterPath || "";
  var backdrop = it.backdropPath || "";
  return {
    id: id,
    type: "url",                                             // ← 关键：不再用 "tmdb"
    title: it.title || "",
    description: it.description || "",
    releaseDate: it.releaseDate || "",
    coverUrl: poster ? IMG_BASE + "/w500" + poster : (backdrop ? IMG_BASE + "/w1280" + backdrop : ""),
    posterPath: poster ? IMG_BASE + "/w500" + poster : "",   // ← 完整 https URL
    backdropPath: backdrop ? IMG_BASE + "/w1280" + backdrop : "",
    mediaType: it.mediaType || "movie",
    rating: it.rating,
    genreTitle: it.genreTitle || "",
    tmdbId: id,                                              // ← 保留，供 stream 播放
  };
}
```

> 播放链路不受影响：stream 模块 `app.mi3s.hires` 的 `loadResource` 只按 `title` 回 CMS 源解析，
> 不依赖 `type` 或 `tmdbId`；条目保留 `title` + `tmdbId` 即可正常出播放地址。

诊断模块 `diag.js`（v6.0.0）提供四个对照入口，一锤定音：
① `type=url` + 完整图（应出海报）② `type=tmdb` + 完整图（对照）③ `type=tmdb` + 相对路径（旧方案，应空白）
④ 网络取片 → `type=url`（真实后端数据 + 新方案）。
①④ 出图、③ 空白，即证明根因是 `type:"tmdb"` 对第三方不可用。

### ⚠️ 后端限流（已处理）

实测该发现后端对同一来源有速率限制：**连续约 16 次请求后返回 HTTP 429**。
因此 4 个列表入口统一 `cacheDuration: 3600`（官方默认），1 小时内同一入口不重复请求；
正常使用（首页 4 行海报 = 4 次请求）远低于阈值，不会触发限流。

> 备选数据源 `assets.vvebo.vip/scripts/datas/latest_*.json`（Forward 静态 JSON）实测
> 国内连通率仅 50~60%，不稳定，故不采用；`Widget.tmdb` 第三方不可用；二者均已排除。

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
