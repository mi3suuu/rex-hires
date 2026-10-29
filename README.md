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

**合集订阅地址（填这一个即可，含全部模块）：**

```
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/manifest.json
```

单个模块直链：

```
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/home.js        # 首页片单 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/hires.js       # 播放源 stream
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/diag.js        # 诊断 video（26 种写法对照）
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@main/4k-sources.js  # 4K 聚合 stream
```

> `raw.githubusercontent.com` 国内基本被墙，直接添加会报「无法识别的模块数据」，务必用 jsDelivr。
> **订阅地址固定用 `@main`（可变分支）**：这样我更新代码后，你在 Rex 里按「刷新」即可拿到新内容。
> 不要用 `@vX.Y.Z` 这种不可变 tag 做订阅——tag 一旦发布内容就锁死，force-move 后 jsDelivr 边缘缓存
> 清不掉（实测 purge 无效），会导致「刷新了还是旧代码」。
> 我每次更新后会调 `https://purge.jsdelivr.net/gh/mi3suuu/rex-hires@main/xxx` 清缓存，你点刷新即生效。

## ★ 根因与最终实现（v8.0.0）

数据源走 Rex 官方发现后端（与 AI 搜索 `rex.nlsearch` 同源），这一点没错。反复「列表空白 / 没有更多」
的定位，最终落在**唯一有「实机海报显示正常」确证的第三方模块**上：

**`ZurlyQin/rex-widgets` 的 TMDB 电影精选模块**（README 实测验证，验证日期 2026-10-29）。它用的写法是：

```js
// ① 入口函数用 async function 声明（不是全局赋值！）
async function latestChinese(params) { ... }

// ② 条目字段：数字 id、数字 rating、type:"tmdb"、TMDB 相对路径 poster
function videoItem(movie) {
  return {
    id: movie.id,                        // 数字（不字符串化）
    type: "tmdb",
    mediaType: "movie",
    title: movie.title,
    posterPath: movie.poster_path || "", // 相对路径 /xxx.jpg
    rating: Number(movie.vote_average) || 0  // 数字
  };
}
```

这直接**推翻了 v5.0.0「id/rating 字符串化」、v6.0.0「type 必须 url」、v7.0.0「函数必须全局赋值」**
三个此前被逐一试错的结论——那些都不是根因。v8.0.0 把 `home.js` 的条目格式与函数形式
照抄到与 ZurlyQin 成品一致：`async function` 声明 + 数字 id/rating + `type:"tmdb"` + 相对路径。

### 诊断模块（diag.js v8.0.0，26 种写法对照）

为一次性锁定根因，诊断模块塞入了 **26 个入口**，每个返回 1 个硬编码条目，标题前缀即变量维度：

| 前缀 | 变量维度 |
|------|---------|
| A | 函数暴露形式：`async function` 声明 vs 全局赋值 |
| B | `type` 取值：tmdb / url / detail / douban / imdb / forward |
| C | id/rating 类型：数字 vs 字符串 vs 无 rating |
| D | 海报字段：相对路径 vs 完整 URL vs coverUrl vs 无 backdrop |
| E | 字段完整度：最简 / 全字段 / 带 genreTitle |
| F | 网络源：`Widget.tmdb.get` vs `Widget.http.post` AI 后端（失败回退硬编码） |
| G | mediaType=tv / rating 整数 / 无 description |

**用法**：资源库点开「诊断」模块，逐个点 26 个入口，哪个出了海报，就把那个维度套用到 home.js。

### ⚠️ 后端限流（已处理）

实测该发现后端对同一来源有速率限制：**连续约 16 次请求后返回 HTTP 429**。
因此 4 个列表入口统一 `cacheDuration: 3600`（官方默认），1 小时内同一入口不重复请求；
正常使用（首页 4 行海报 = 4 次请求）远低于阈值，不会触发限流。

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
