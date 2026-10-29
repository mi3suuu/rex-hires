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
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/home.js        # 首页片单 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/hires.js       # 播放源 stream
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/diag.js        # 诊断 video
https://cdn.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/4k-sources.js  # 4K 聚合 stream
```

> `raw.githubusercontent.com` 国内基本被墙，直接添加会报「无法识别的模块数据」，务必用 jsDelivr。
> 统一用不可变 tag `@v4.1.0`（`@main` 有 12h/7d 强缓存，改了代码不生效）。
> 更新后如需立即生效，访问 `https://purge.jsdelivr.net/gh/mi3suuu/rex-hires@v4.1.0/home.js` 刷新 CDN。

## ★ 根因与最终实现（v4.1.0）

「列表空白 / 没有更多了」的**真正根因不是字段格式**，而是 `Widget.tmdb` 在真实渲染环境
（资源库/首页）对第三方模块不可用——它在「调试」环境能返回数据，但渲染环境拿不到，
导致列表空。

用户设备上唯一确认能正常显示的是官方「AI 搜索」模块（`rex.nlsearch`），它走的是
**Rex 官方发现后端**，而不是 `Widget.tmdb`：

```js
// 与 AI 搜索逐字节同构
const response = await Widget.http.post(
  "https://api.rexnow.tv/api/discovery/ai-search/search",
  { query: "热门电影", userId: "", language: "zh-CN" },
  { headers: { "Content-Type": "application/json" } }
);
const data = response.data;
if (!data || !data.success) throw new Error((data && data.message) || "搜索失败");
return data.data || [];   // 条目由后端生成，客户端必然能渲染
```

后端返回的条目字段：`id`(数字)、`type:"tmdb"`、`title`、`posterPath`(相对路径 `/xxx.jpg`)、
`backdropPath`、`mediaType:"movie"|"tv"`、`rating`(数字)、`genreTitle`(`" / "` 分隔)。
**这套格式就是 AI 搜索的格式**，`home.js` 原样透传，因此渲染行为与 AI 搜索一致。

> 之前误以为「`id`/`rating` 必须是字符串」（来自 `@rexnow/libs` 的 TS 类型声明），
> 那是类型声明 ≠ 渲染契约的误导。实际客户端对后端下发的数字 id/rating 完全能渲染
> （AI 搜索就是证据）。第三方模块的稳妥做法就是：**别自己拼 TMDB，直接调官方发现后端**。

诊断模块 `diag.js` 提供双入口对照：① 后端取片（照抄 AI 搜索）② TMDB 取片（旧方案）。
哪个入口有内容，就证明哪种数据源在真实渲染环境可用。

### ⚠️ 后端限流（v4.1.0 已处理）

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
